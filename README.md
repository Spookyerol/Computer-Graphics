# Computer-Graphics htbk26

This webgl program features a model of St.Marys Williamson building and its immediate surroundings
including some of the paths, grass and small service road to the front. There are 5 main models;
the building, environment, road, a street light and the car with the car moving along the length of the road.

The program is capable of loading textures and applying them to cuboids and can draw cuboids, 
3D triangles, cylinders and 3D right angled triangles. Both directional and ambient lighting is
present and the direction and color of said light can be changed in the source. The camera view
angle and position can also be changed in the paramaters of setLookAt.

The model is hosted through a basic CORS enabled express server and can be started typing
'node index.js' on any command console that is on this directory. You can then use a web
browser and navigate to localhost:3000 in order to see the model. You may use the arrow
keys in order to rotate the model.

Disclaimer: Program was tested only on google Chrome and microsoft edge (on my machine edge ran
much faster and smoother).