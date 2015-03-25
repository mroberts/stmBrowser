#Function for outputing STM dataset into json
#mod: stm model
#data: data for stm model
#covariates: vector of covariates you want to visualize
#text: name of covariate where the text is held
stmBrowser <- function(mod, data, covariates, text, id=NULL, n=1000,
                       labeltype="prob", directory=getwd()){

    #Error checking:
    if(nrow(data)!=nrow(mod$theta)){
        stop("Data has a different number of rows than the STM output")
    }
    if(class(covariates)!="character"){
        stop("Please pass the names of the covariates as character strings.")
    }
    
    oldwd <- getwd()

        #Move jss files into directory
    setwd(directory)
    if(file.exists("stm-visualization")){
        y <- readline(prompt="stm-visualization folder already exists, type 1 to overwrite, 0 otherwise, then press Enter. ")
        if(y=="1"){
          unlink("stm-visualization", recursive=TRUE)
          dir.create("stm-visualization")
          files =
              list.files(sprintf("%s/stm-viz-master/",path.package("stmBrowser")))
          file.copy(paste(path.package("stmBrowser"),
                          "/stm-viz-master/",files, sep=""),
                    "stm-visualization", recursive=T)
                                        #system(paste("cp -r ", paste(path.package("stmBrowser"),
             #                            "/stm-viz-master", sep=""), " stm-visualization",
             #            sep=""))
            dir.create("stm-visualization/data")
            setwd("stm-visualization/data")
        }else if(y=="0"){
            k <-
                readline(prompt="Write alternate folder name for visualization, then press enter. ")
            unlink(k, recursive=TRUE)
            dir.create(k)
            files =
                list.files(sprintf("%s/stm-viz-master/",path.package("stmBrowser")))
            file.copy(paste(path.package("stmBrowser"),
                            "/stm-viz-master/",files, sep=""),
                      k, recursive=T)            
            dir.create(paste(k,"/data", sep=""))
            setwd(paste(k,"/data", sep=""))
        } else{
            stop("Error, invalid answer.")
        }
    }else{
        dir.create("stm-visualization")
        files =
            list.files(sprintf("%s/stm-viz-master/",path.package("stmBrowser")))
        file.copy(paste(path.package("stmBrowser"),
                        "/stm-viz-master/",files, sep=""),
                  "stm-visualization", recursive=T)
        dir.create("stm-visualization/data")
        setwd("stm-visualization/data")
    }
    n <- min(nrow(data), n)
    print(paste("Sampling", n, "documents for visualization."))
    samp <- sample(1:nrow(data), n)
    #Write out doc level stuff
    theta <- mod$theta[samp,]
    data <- data[samp,]
    start <- "var data = ["
    for(i in 1:nrow(data)){
        doc <- list()
        if(!is.null(id)) doc$id <- gsub("\\.", "\\-", data[,id][i])
        if(is.null(id)) doc$id <- i
        doc$body <- data[,text][i]
        for(j in 1:length(covariates)){
            if(is.factor(data[,covariates[j]])) {
                data[,covariates[j]]<-
                    as.character(data[,covariates[j]])
            }
            if("POSIXt"%in%class(data[,covariates[j]])){
                dateout <- jsonlite::toJSON(data[,covariates[j]],
                                            POSIXt="ISO8601")
                data[,covariates[j]] <- jsonlite::fromJSON(dateout)
            }
            if(class(data[,covariates[j]])=="Date"){
                dateout <- jsonlite::toJSON(data[,covariates[j]],
                                            Date="ISO8601")
                data[,covariates[j]] <- jsonlite::fromJSON(dateout)
            }
        }
        for(j in 1:length(covariates)){
            doc[covariates[j]] <- data[,covariates[j]][i]
        }
        for(j in 1:ncol(theta)){
            doc[paste("Topic", j)] <- theta[i,j]
        }
        if (i!=nrow(data)) start <- paste(start, rjson::toJSON(doc), ",",
                sep="")
        if (i==nrow(data)) start <- paste(start, rjson::toJSON(doc), "]", sep="")
    }
    fileConn <- file("output.js")
    writeLines(start, fileConn)
    close(fileConn)

    topics <- labelTopics(mod, n=3)[[labeltype]]
    start <- "var topics = ["
    for(i in 1:nrow(topics)){
        topic <- list()
        topic$name <- paste("Topic", i)
        topic$list <- paste(topics[i,], collapse=", ")
        if (i!=nrow(topics)) start <- paste(start,
                rjson::toJSON(topic), ",",
                        sep="")
        if (i==nrow(topics)) start <- paste(start, rjson::toJSON(topic), "]", sep="")
    }
    fileConn2 <- file("topics.js")
    writeLines(start, fileConn2)
    close(fileConn2)
    setwd("..")
    dir <- getwd()
    cat(paste("URL is at ", getwd(),
                "/index.html, opening now.", sep=""))
    setwd(oldwd)
    browseURL(paste(dir, "/index.html", sep=""))
}
