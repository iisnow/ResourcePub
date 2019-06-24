
export default class Route{
    constructor(id,lvl){
        this.initRouteMap();

        this.shipOn = [];
        this.setCurrentRoute(id,lvl);
        this.placeCallBack = ()=>{};
    }

    initRouteMap(){
        this.propMap = [
            {
                name:"First Route",
                distance:10000,
                backPath:"images/RouteBG.png",
                resource:[
                    [150,20,200,1],
                    [200,50,250,2],
                    [220,100,300,5]
                ],
                safeFix:[[145,823],[200,900],[400,1200]],
                safeMax:[50,40,30],
                maxShip:[2,3,4],
                level:[
                    [1000,500,1000,10],
                    ['60000',1400,'75000',250],
                    [0,0,0,0]
                ],
                unlock:[
                    [0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0]
                ],
                maxLevel:3
            },
            {
                name:"Danger Route",
                distance:[50000],
                backPath:"images/RouteBG2.png",
                resource:[
                    [1000,5000,3500,40]
                ],
                safeFix:[[122,577]],
                safeMax:[200],
                maxShip:[2],
                unlock:[['80000','80000','80000','1000']],
                maxLevel:1
            },
            {
                name:"Last Route",
                distance:[200000],
                backPath:["images/RouteBG3.png"],
                resource:[
                    [6000,4200,13000,600]
                ],
                safeFix:[[98,324]],
                safeMax:[400],
                maxShip:[2],
                maxLevel:1
            }
        ];
    }

    setCurrentRoute(_id,_lvl){
        this.routeID = _id;
        this.curLevel = _lvl;

        var dataAllLevel = this.propMap[_id];
        this.curData = {};

        for(var key in dataAllLevel){
            if(dataAllLevel.hasOwnProperty(key)){
                var value = dataAllLevel[key];
                if(Object.prototype.toString.call(value) === "[object Array]"){
                    this.curData[key] = value[this.curLevel];
                }else{
                    this.curData[key] = value;
                }
            }
        }
    }

    levelUP(){
        this.setCurrentRoute(this.routeID,this.curLevel + 1);
    }

    isMaxLevel(){
        return this.curLevel >= this.curData.maxLevel - 1;
    }

    setPlaceCallBack(_func){
        this.placeCallBack = _func;
    }

    placeShip(_shipSet){
        this.shipOn.push(_shipSet);
        _shipSet.placeOnRoute(this);

        this.placeCallBack(_shipSet);
    }

    shipFull(){
        return this.shipOn.length >= this.curData.maxShip;
    }

    shipCount(){
        return this.shipOn.length;
    }

    loseShip(_shipSet){
        for(var i=0;i<this.shipOn.length;i++){
            if(this.shipOn[i] == _shipSet){
                this.shipOn.splice(i,1);
                break;
            }
        }
        this.placeCallBack(null,_shipSet);
    }

    getDistance(){
        return this.curData.distance;
    }
}