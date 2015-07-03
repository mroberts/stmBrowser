\name{stmBrowser}
\alias{stmBrowser}
%- Also NEED an '\alias' for EACH other topic documented here.
\title{
Outputs json file and creates visualization from stm.
}
\description{
This function outputs necessary json files to a working directory, then
opens a browser with the visualization of the relationship between
covariates and topics in the stm.
}
\usage{
stmBrowser(mod, data, covariates, text, id = NULL,
     n = 1000, labeltype ="prob", directory=getwd())
}
%- maybe also 'usage' for other objects documented here.
\arguments{
  \item{mod}{
    STM model output.
}
  \item{data}{
    Data associated with the stm model
}
  \item{covariates}{
    Names of covariates you are interested in plotting.
}
  \item{text}{
    Name of the variable within the dataset that corresponds to the text.
}
  \item{id}{
    Name of ID variable for each observation.
}
  \item{n}{
    Number of observations to plot.  Maximum is 5000.
}
  \item{labeltype}{
    Type of label for topics (see \code{\link[stm]{labelTopics}} in the \pkg{stm} package for
    more information)
  }
  \item{directory}{
    Directory where the stm visualization should be outputted. Default
    is the current working directory.
  }
}
\value{
  The html file for the browser will be written to the folder the user
  selects as \code{index.html}.  The user can open this webpage to view
  the browser.
}

\seealso{
\code{\link[stm]{stm}}
}
\examples{
library(stm)
data(poliblog5k)
#Create date
dec312007 <- as.numeric(as.Date("2007-12-31"))
poliblog5k.meta$date <- as.Date(dec312007+poliblog5k.meta$day,
                                                          origin="1970-01-01")
out <- prepDocuments(poliblog5k.docs, poliblog5k.voc, poliblog5k.meta)
stm.out <- stm(out$documents, out$vocab, K=10,
                              prevalence=~rating + date,
                              data=out$meta,
                              max.em.its=1) #generally run models
                                        #longer than this.
library(stmBrowser)
setwd(tempdir())
stmBrowser(stm.out, data=out$meta, c("rating", "date"),
                   text="text")
#Remove files
unlink("stm-visualization", recursive=TRUE)
}
