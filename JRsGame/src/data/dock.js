export default class Dock{
    constructor(lvl){

        this.shipChangeCallBack = ()=>{};

        this.initDockMap();
        this.SetLevel(lvl);
    }

    initDockMap(){
        this.proMap = [
            {cap:4,level:[2000,2000,2000,100]},
            {cap:5,level:[200000,200000,200000,1000]},
            {cap:6,level:[0,0,0,0]}
        ];
        this.dockSet = {};
    }

    setDockCallBack(_func){
        this.shipChangeCallBack = _func;
    }

    LevelUP(){
        this.SetLevel(this.level + 1);
    }

    SetLevel(_lvl){
        this.level = _lvl;
        var curPro = this.proMap[this.level];
        this.shipCap = curPro.cap;
        this.levelUp = curPro.level;
    }

    GetShipCap(){
        return this.shipCap;
    }

    GetShipSet(_index){
        if(this.dockSet.hasOwnProperty(_index)){
            return this.dockSet[_index];
        }else{
            return null;
        }
    }

    outShip(_index){
        this.shipChangeCallBack("busy",_index);
    }

    dropShip(_index){
        this.shipChangeCallBack("resume",_index);
    }
}