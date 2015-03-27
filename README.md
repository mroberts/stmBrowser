##stmBrowser: An R Package for the Structural Topic Model Browser

Website: www.structuraltopicmodel.com

Authors: [Michael Freeman](http://mfviz.com), [Jason Chuang](http://jason.chuang.info), [Molly Roberts](http://margaretroberts.net), [Brandon Stewart](http://scholar.harvard.edu/bstewart) and [Dustin Tingley](http://scholar.harvard.edu/dtingley)

Please email all comments/questions to molly.e.roberts [at] gmail.com

###Summary

This repository will host the development version of the STM Browser.  It is also available on CRAN. It provides an interactive environment for exploring STM model results in a web browser, optimized for Chrome.  The visualization pairs a configurable scatter plot with the full text of a selected document.  The interactive scatterplot allows specification of the x-position, y-position, color, and radius of each document based on metdata.  

The package currently includes functionality to:
* visualize both continuous and categorical covariate relationships with topics
* change the size, color, and orientation of topics and covariates to explore the visualization
* click on documents within the visualization to read them

##Example Browser and Screenshots
[Click here](http://pages.ucsd.edu/~meroberts/stm-online-example/index.html) for an example of the browser using the [PoliBlogs dataset](http://reports-archive.adm.cs.cmu.edu/anon/ml2010/CMU-ML-10-101.pdf).

A few screenshots from this example:

Political blogs write about Sarah Palin topic over the course of 2008:

![Political blogs talk about Sarah Palin topic over 2008](https://raw.githubusercontent.com/mroberts/stmBrowser/master/screenshots/OnlineScreenshot1.png)

Comparison of conservative and libaral blogs on the financial crisis, in 2008:
![Conservative versus liberal talk about financial crisis 2008](https://raw.githubusercontent.com/mroberts/stmBrowser/master/screenshots/OnlineScreenshot2.png)

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