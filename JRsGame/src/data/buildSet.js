import Ship from "../data/ship"

export default class BuildList{
    constructor(_rank){
        this.rank = _rank - 1;
        this.stTime = new Date();
        this.bid = this.randomCode();

        this.initBuildMap();
    }

    initBuildMap(){
        this.buildMap = [
            {
                need:[500,500,500,0],
                tCost:30
            },{
                need:[6000,6000,6000,50],
                tCost:180
            },{
                need:['700000','700000','700000',400],
                tCost:1080
            }
        ];
    }

    randomCode(){
        return `${Math.random()}`.slice(2,-1);
    }

    getTimeLeft(){
        var tCost = this.buildMap[this.rank].tCost;
        var now = new Date();
        var timePass = (now - this.stTime) / 1000;
        return tCost - timePass;
    }

    checkOK(){
        return this.getTimeLeft() <= 0;
    }

    getBuildResult(){
        return new Ship(0,-1);
    }
}