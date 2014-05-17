# CS419 Homework 1

1. (Construct a mechanical arm) Build a mechanical linkage with three parts. The torso (a sphere), the upper arm (a cylinder), and the lower arm (a cylinder). Assume that the torso is fixed, and that the skeletons of upper arm and lower arm can move inside a plane that passes through the center of the torso (as a sphere). Write a user interface such that the user can input the joint angles between the upper arm and the torso, and between the upper arm and the lower arm. Based on these angles, animate the linkage.
2. (Reaching for a ball) Implement the following interface and algorithm. When clicking on the image plane, you system will compute the appropriate joint angles that allow the end of the lower arm to be at the clicked point. Do not move the torso.
- Compare two cases. In the first case, you always assume to the linkage to start with the resting pose. In the second case, you start with the current pose. How interactive is your system? Can you keep moving the mouse and the arms keep moving, too? If the two consecutive clicking points are antipodal, how does your system behave?
- Enhance the above system to allow the torso in the plane. Compare this with the case when the torso cannot move. Do you have a way of letting your system favor either torso movement or arm movement if multiple solutions exist?