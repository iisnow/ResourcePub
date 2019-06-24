import BigNumber from "../libs/bignumber.js"

export default class Resource{
    constructor(_arr){
        var arr = _arr ? _arr : [0,0,0,0];
        this.resNum = {
            oil:new BigNumber(arr[0]),
            ammo:new BigNumber(arr[1]),
            steel:new BigNumber(arr[2]),
            Al:new BigNumber(arr[3])
        };
        Object.assign(this,this.resNum);
        this.changeCallBackMap = {}
        this.changeCallBack = (res)=>{
            for(var key in this.changeCallBackMap){
                if(this.changeCallBackMap.hasOwnProperty(key) && this.changeCallBackMap[key]){
                    this.changeCallBackMap[key](res);
                }
            }
        };
    }

    randomResouce(maxArr,capSet){
        this.resNum.oil = BigNumber(maxArr[0]).times(Math.random());
        this.resNum.ammo = BigNumber(maxArr[1]).times(Math.random());
        this.resNum.steel = BigNumber(maxArr[2]).times(Math.random());
        this.resNum.Al = BigNumber(maxArr[3]).times(Math.random());

        var sum = this.resNum.oil.plus(this.resNum.ammo).plus(this.resNum.steel).plus(this.resNum.Al);

        var cap = BigNumber(capSet);
        if(sum.gt(cap)){
            var fix = cap.div(sum);
            this.resNum.oil = this.resNum.oil.times(fix);
            this.resNum.ammo = this.resNum.ammo.times(fix);
            this.resNum.steel = this.resNum.steel.times(fix);
            this.resNum.Al = this.resNum.Al.times(fix);
        }
    }

    getResource(name)
    {
        if(Object.keys(this.resNum).index(name) >= 0)
            return this.resNum[index];
        else
            return new BigNumber(0);
    }

    buildObj(){
        var res = {};
        for(var key in this.resNum){
            if(this.resNum.hasOwnProperty(key)){
                var number = BigNumber(this.resNum[key]);
                if(!number.eq(0))
                    res[key] = number;
            }
        }
        return res;
    }

    printDebug(){
        console.log(`Resource:[oil]:${this.resNum.oil.toUnit()}\n[ammo]:${this.resNum.ammo.toUnit()}\n[steel]:${this.resNum.steel.toUnit()}\n[Al]:${this.resNum.Al.toUnit()}\n`);
    }

    costRes(cost){
        for(var key in this.resNum){
            var changeNumber = BigNumber(cost[key]);
            if(this.resNum.hasOwnProperty(key)){
                this.resNum[key] = this.resNum[key].minus(changeNumber);
            }
        }
        this.changeCallBack.call(this,this.resNum);
    }

    resourceChange(change){
        for(var key in this.resNum){
            var changeNumber = BigNumber(change[key]);
            if(this.resNum.hasOwnProperty(key)){
                this.resNum[key] = this.resNum[key].plus(changeNumber);
            }
        }
        this.changeCallBack.call(this,this.resNum);
    }

    checkResource(need){
        for(var key in this.resNum){
            var mapNumber = BigNumber(need[key]);
            if(this.resNum.hasOwnProperty(key) && 
                this.resNum[key].lt(mapNumber)){
                return false;
            }
        }
        return true;
    }

    addChangeCallBack(func,key){
        this.changeCallBackMap[key] = func;
    }
}
