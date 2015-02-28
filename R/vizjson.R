#Function for outputing STM dataset into json
#mod: stm model
#data: data for stm model
#covariates: vector of covariates you want to visualize
#text: name of covariate where the text is held
vizjson <- function(mod, data, covariates, text, id=NULL, n=1000,
                    labeltype="prob", directory=getwd()){
    #Move jss files into directory
    setwd(directory)
    if(file.exists("stm-visualization")){
        cat("stm-visualization folder already exists, type 1 to overwrite, 0 otherwise, then press Enter.")
        y <- readLines(n=1)
        if(y==1){
            system("rm -r stm-visualization")
            system(paste("cp -r ", paste(path.package("stmviz"),
                                         "/stm-viz-master", sep=""), " stm-visualization",
                         sep=""))
            dir.create("stm-visualization/data")
            setwd("stm-visualization/data")
        }else if(y==0){
            cat("Write alternate folder name for visulaization, then press enter.")
            k <- readLines(n=1)
            system(paste("cp -r ", paste(path.package("stmviz"),
                                         "/stm-viz-master", sep=""), k,
                         sep=""))
            dir.create(paste(k,"/data", sep=""))
            setwd(paste(k,"/data", sep=""))

        } else{
            stop("Error, invalid answer.")
        }
    }else{
        system(paste("cp -r ", paste(path.package("stmviz"),
                                    "/stm-viz-master", sep=""), " stm-visualization",
                     sep=""))
        dir.create("stm-visualization/data")
        setwd("stm-visualization/data")
    }   
    samp <- sample(1:nrow(data), n)
    #Write out doc level stuff
    theta <- mod$theta[samp,]
    data <- data[samp,]
    start <- "var data = ["
    for(i in 1:nrow(data)){
        doc <- list()
        if(!is.null(id)) doc$id <- data[,id][i]
        if(is.null(id)) doc$id <- 1:nrow(data)
        doc$body <- data[,text][i]
        for(j in 1:length(covariates)){
            if(is.factor(data[,covariates[j]])) {
                data[,covariates[j]]<-
                    as.character(data[,covariates[j]])
            }
        }
        for(j in 1:length(covariates)){
            doc[covariates[j]] <- data[,covariates[j]][i]
        }
        for(j in 1:ncol(theta)){
            doc[paste("Topic", j)] <- theta[i,j]
        }
        if (i!=nrow(data)) start <- paste(start, toJSON(doc), ",",
                sep="")
        if (i==nrow(data)) start <- paste(start, toJSON(doc), "]", sep="")
    }
    fileConn <- file("output.js")
    writeLines(start, fileConn)
    close(fileConn)

    topics <- labelTopics(mod, n=3)[[labeltype]]
    start <- "var topics = ["
    for(i in 1:nrow(topics)){
        topic <- list()
        topic$name <- paste("Topic", i)
        topic$list <- paste(topics[i,], collapse=",")
        if (i!=nrow(topics)) start <- paste(start, toJSON(topic), ",",
                        sep="")
        if (i==nrow(topics)) start <- paste(start, toJSON(topic), "]", sep="")
    }
    fileConn2 <- file("topics.js")
    writeLines(start, fileConn2)
    close(fileConn2)
    setwd("..")
    print(paste("URL is at", getwd(),
                "index.html, opening now.", sep=""))
    BROWSE(paste(getwd(), "/index.html", sep=""))
}
