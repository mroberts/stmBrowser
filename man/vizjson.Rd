\name{vizjson}
\alias{vizjson}
%- Also NEED an '\alias' for EACH other topic documented here.
\title{
%%  ~~function to do ... ~~
}
\description{
%%  ~~ A concise (1-5 lines) description of what the function does. ~~
}
\usage{
vizjson(mod, data, covariates, text, id = NULL, n = 1000, labeltype = "prob")
}
%- maybe also 'usage' for other objects documented here.
\arguments{
  \item{mod}{
%%     ~~Describe \code{mod} here~~
}
  \item{data}{
%%     ~~Describe \code{data} here~~
}
  \item{covariates}{
%%     ~~Describe \code{covariates} here~~
}
  \item{text}{
%%     ~~Describe \code{text} here~~
}
  \item{id}{
%%     ~~Describe \code{id} here~~
}
  \item{n}{
%%     ~~Describe \code{n} here~~
}
  \item{labeltype}{
%%     ~~Describe \code{labeltype} here~~
}
}
\details{
%%  ~~ If necessary, more details than the description above ~~
}
\value{
%%  ~Describe the value returned
%%  If it is a LIST, use
%%  \item{comp1 }{Description of 'comp1'}
%%  \item{comp2 }{Description of 'comp2'}
%% ...
}
\references{
%% ~put references to the literature/web site here ~
}
\author{
%%  ~~who you are~~
}
\note{
%%  ~~further notes~~
}

%% ~Make other sections like Warning with \section{Warning }{....} ~

\seealso{
%% ~~objects to See Also as \code{\link{help}}, ~~~
}
\examples{
##---- Should be DIRECTLY executable !! ----
##-- ==>  Define data, use random,
##--	or do  help(data=index)  for the standard data sets.

## The function is currently defined as
function (mod, data, covariates, text, id = NULL, n = 1000, labeltype = "prob") 
{
    samp <- sample(1:nrow(data), n)
    theta <- mod$theta[samp, ]
    data <- data[samp, ]
    start <- "var data = ["
    for (i in 1:nrow(data)) {
        doc <- list()
        if (!is.null(id)) 
            doc$id <- data[, id][i]
        if (is.null(id)) 
            doc$id <- 1:nrow(data)
        doc$body <- data[, text][i]
        for (j in 1:length(covariates)) {
            if (is.factor(data[, covariates[j]])) {
                data[, covariates[j]] <- as.character(data[, 
                  covariates[j]])
            }
        }
        for (j in 1:length(covariates)) {
            doc[covariates[j]] <- data[, covariates[j]][i]
        }
        for (j in 1:ncol(theta)) {
            doc[paste("Topic", j)] <- theta[i, j]
        }
        if (i != nrow(data)) 
            start <- paste(start, toJSON(doc), ",", sep = "")
        if (i == nrow(data)) 
            start <- paste(start, toJSON(doc), "]", sep = "")
    }
    fileConn <- file("output.js")
    writeLines(start, fileConn)
    close(fileConn)
    topics <- labelTopics(mod, n = 3)[[labeltype]]
    start <- "var topics = ["
    for (i in 1:nrow(topics)) {
        topic <- list()
        topic$name <- paste("Topic", i)
        topic$list <- paste(topics[i, ], collapse = ",")
        if (i != nrow(topics)) 
            start <- paste(start, toJSON(topic), ",", sep = "")
        if (i == nrow(topics)) 
            start <- paste(start, toJSON(topic), "]", sep = "")
    }
    fileConn2 <- file("topics.js")
    writeLines(start, fileConn2)
    close(fileConn2)
  }
}
% Add one or more standard keywords, see file 'KEYWORDS' in the
% R documentation directory.
\keyword{ ~kwd1 }
\keyword{ ~kwd2 }% __ONLY ONE__ keyword per line
