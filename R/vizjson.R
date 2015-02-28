#Function for outputing STM dataset into json
#mod: stm model
#data: data for stm model
#covariates: vector of covariates you want to visualize
#text: name of covariate where the text is held
vizjson <- function(mod, data, covariates, text, id=NULL, n=1000, labeltype="prob"){
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
}
