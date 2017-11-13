# PhysioEx: Visual Analytics of Physiological Data Streams
<i>Developed by Rishikesan Kamaleswaran</i>
<br><br> Details on this program can be found in this paper:
  - Kamaleswaran, R., Collins, C., James, A. and McGregor, C., 2016, June. PhysioEx: visual analysis of physiological event streams. In Computer Graphics Forum (Vol. 35, No. 3, pp. 331-340).

# Build Instructions
You must install node and then issue the follow commands to install all node modules:

```
npm install
```
Once all modules have been installed you can execute the program by this command:
```
node ./physio.js
```
The main program connects to an IBM DB2 database where raw data is stored, however a demo of this program can be seen by visiting the following page after running the node command:
```
http://localhost:8888
```
