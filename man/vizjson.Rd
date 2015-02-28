\name{vizjson}
\alias{vizjson}
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
vizjson(mod, data, covariates, text, id = NULL, n = 1000, labeltype = "prob")
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
    Type of label for topics (see labelTopics in the stm package for
    more information)
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
  
}
\note{
%%  ~~further notes~~
}

%% ~Make other sections like Warning with \section{Warning }{....} ~

\seealso{
%% ~~objects to See Also as \code{\link{help}}, ~~~
}
\examples{
}
\keyword{ ~kwd1 }
\keyword{ ~kwd2 }% __ONLY ONE__ keyword per line
