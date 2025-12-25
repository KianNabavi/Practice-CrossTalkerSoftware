# Cross Talker Visualization Software

## Introduction

Welcome to the Cross Talker Visualization Software tool. This is a tool created to visualize the metabolomic interactions of different species using the Cross Talker plates. This is a tutorial that will be covering the different capabilities, options, and customizations of the software, as well as providing a tutorial for first-time use. 

This software has been created by **Kian**, from the [University of Western Ontario](https://www.schulich.uwo.ca/index.html).



## Main Specifications and Capabilities

The software is to be used as an analysis and visualization tool after the Cross Talker plates have been used (and sampled). After which, the raw data from concentrations of different metabolites is to be uploaded into the tool to visualize. The software has various capabilities when it comes to visualizing; almost all elements can be resized, colours and backgrounds can be changed, and descriptive text can be added and removed at will. It is however very important that raw data is first transformed into a <ins>**formatted CSV file**</ins> that can be properly understood by the software. For the template and for example datafiles, look at our [Github page](https://www.schulich.uwo.ca/bmsc/current-students/admission-progression/to-medical-sciences-2.html).


## What is a Cross Talker?

The Cross Talker is a plate created to observe metabolomic interactions between different species. In the Cross Talker, species and metabolites are loaded into different interconnecting wells. Then, using tools such as Liquid Chromotography Mass Spectrometry (LC-MS), the concentrations and identities of metabolites present in different wells, including community wells (where interspecies interactions take place). This results in empirical data and numbers being outputted by the LC-MS. This is the data that is then used for visualizations. 

## How is this data turned into visuals?

The specific metabolimic data that is fed into the tool has a very clear format with each row represents a compound in each species, as well as one row for the community well and an extra row for control. For each of these rows, the following data is collected:
- Compound name
- Species and/or type (Community + Control)
- [Diffusion coefficient](https://www.schulich.uwo.ca/bmsc/current-students/admission-progression/to-medical-sciences-2.html)
- Then, for each time point that data was collected, there will be one column for:
    - Time point (in hours)
    - Concentration 
    - Standard deviation

## **Instructions**
The first step to using the tool is formatting the data into the CSV file format. 
Once the file is ready, you can proceed to  

### **Compound Population**
The program then analyzes the data, recognizing the different compounds, creating a dropdown list of all compounds present in the datafile (up to 200). It is strongly recommended that for each visualization, only <ins>**up to 15 compounds**</ins> are chosen at a time to visualize. This number however is arbitrary, but has been proven to look good???? in testing. 

### **Species Population**
The program also recognizes and populate the different specie present in the dataset and a list of species is populated. Below the compound selection section, there are three dropdown selection menus. Using these dropdowns, the user is able to choose which species appears in which rectangle/section of the diagram. It is possible to have three unique species, or have repeated species in 2 or 3 rectangles. After compounds and species have been chosen, the user has to press the **Visualize** button for an intiial diagram draft to be populated. 

### **Time**
The next step in the process is to choose a time-point for processing. The program automatically processes the CSV file and populates a dropdown for all sets of time + concentration + tandard deviation. By choosing a time point, the program uses the concentration and standard deviation of each compound in each species, and uses the control and community data to [caculate flux](link) and [calculate node sizes](link) for the concentration of each compound at the chosen time. Once a time point is chosen, the visuals with [flux](link) arrows and concentration nodes is populated. 

### **Normalized and Raw Concentration**
Initially, when the program runs for the first time, the nodes for the concentration at each compound is calculated and the raw concentrations are scaled on a logarythmic scale with the highest concentration amount being assigned to the largest node circle radius and the lowest concentration being assigned to the smallest node size and radius. 
However, the user is also given the option to use normalized concentration values instead of raw values. When using raw values, metabolites that are main carbon sources are usually found in much higher concentrations (such as glucose and lactose). With these tremendously large concentration values, they would skew the concentration scales. For this reason, there is an option normalize these values.
The normalization formula is as follows, for each compound of each species:

The normalized concentration is computed as:

$$
\text{Normalized Concentration}
=
\frac{
\text{[Compound]}_{t} - \text{[Control]}_{t}
}{
\sqrt{
(\text{SD}_{t} \cdot \text{[Compound]}_{t}^{2})
+
(\text{Control SD}_{t} \cdot \text{[Control]}_{t}^{2})
}
}
$$

Where $\text{[Compound]}_{t}$ is the concentration of the compound at time t, $\text{[Control]}_{t}$ is the concentration of the control of that compound at time t, $\text{SD}_{t}$ is the standard deviation of the compound's concentration at time t, and $\text{Control SD}_{t}$ is the standard deviation of the control at time t. 
