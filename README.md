##stmBrowser: An R Package for the Structural Topic Model Browser

Website: www.structuraltopicmodel.com

Authors: [Michael Freeman](http://mfviz.com) Jason Chuang [Molly Roberts](http://margaretroberts.net), [Brandon Stewart](http://scholar.harvard.edu/bstewart) and [Dustin Tingley](http://scholar.harvard.edu/dtingley)

Please email all comments/questions to molly.e.roberts [at] gmail.com

###Summary

This repository will host the development version of the STM Browser.  It is also available on CRAN. It implements a visualization of the Structural Topic Model (stm) that allows users to visualize relationships between topics and covariates.

The package currently includes functionality to:
* output a visualization from an stm model
* visualize both continuous and categorical covariate relationships with topics
* click on documents within the visualization to read them

###Other Resources

Papers on the Structural Topic Model:
* Roberts, Stewart and Airoldi. "Structural Topic Models" Copy available [here](http://scholar.harvard.edu/files/bstewart/files/stm.pdf)
* Roberts, Stewart, Tingley, and Airoldi. "The Structural Topic Model and Applied Social Science." *Advances in Neural Information Processing Systems Workshop on Topic Models: Computation, Application, and Evaluation*. 2013. Copy available [here](http://scholar.harvard.edu/files/bstewart/files/stmnips2013.pdf)
* Roberts, Stewart, Tingley, Lucas, Leder-Luis, Gadarian, Albertson, and Rand. "Structural topic models for open-ended survey responses." *American Journal of Political Science*. Forthcoming. Copy available [here](http://scholar.harvard.edu/files/dtingley/files/topicmodelsopenendedexperiments.pdf)
* Lucas, Nielsen, Roberts, Stewart, Storer, and Tingley. "Computer assisted text analysis for comparative politics." Copy available [here](http://scholar.harvard.edu/files/dtingley/files/comparativepoliticstext.pdf)
* Reich, Tingley, Leder-Luis, Roberts and Stewart.  "Computer-Assisted Reading and Discovery for Student Generated Text in Massive Open Online Courses" Copy available [here](http://scholar.harvard.edu/files/dtingley/files/educationwriteup.pdf)

### Installation Instructions
Assuming you already have R installed (if not see http://www.r-project.org/),
to install the CRAN version, simply use:
```
install.packages("stmBrowser")
```
You can install the most recent development version using the devtools package.  First you have 
to install devtools using the following code.  Note that you only have to do this once
```  
if(!require(devtools)) install.packages("devtools")
```   
Then you can load the package and use the function `install_github`

```
library(devtools)
install_github("mroberts/stmBrowser",dependencies=TRUE)
```

### Getting Started
See the documentation for example analyses.  The main function to estimate the model is `stmBrowser()`. 