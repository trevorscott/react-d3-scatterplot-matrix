# react-d3-scatterplot-matrix

Based off of https://bl.ocks.org/mbostock/4063663

GNU General Public License, version 3. 

This is a work in progress. Better documentation coming soon.

## Description


A Scatterplot Matrix react component design for the visualization of results yielded by the k-means algorithm. Features an interactive legend, data selection & brushing. 

## usage

Install 
```
npm install react-d3-scatterplot-matrix --save
```

Import the component into your source code:

```
  import Matrix from 'react-d3-scatterplot-matrix';
```

Call the component with a plotId and properly formatted data / centroids:

```
  <Matrix plotId="kMeans" data={this.state.matrixData} centroids= {this.state.centroids} />
```



## Properties

The React Component takes 3 required props:

```
  data: array
  centroids: array
  plotId: string
```

data & centroids properties are of this format:

```
[
  {
    "0" : 152.9655172413793
    "1" : 474.82758620689657
    "2" : 120.41379310344827
    "centroid" : 0
  }
]
```

`plotId` is a unique identifier for your component


## release

```
npm run build
```

make sure release version matches the version in package.json

```
git commit 

git push
```

got to github, create release


create scoped package? 

```
npm publish
```

 

