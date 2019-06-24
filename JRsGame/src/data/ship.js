import GameDatas from "../manager/GameDatas"

export default class Ship {
    constructor(_id,_cid){

        this.initShipMap();

        //this.shipID = _id;      //船的标记ID
        //this.CagID = _cid;      //玩家船的获得ID

        this.insData = {};        //当前实例的数据，包括升级等数据
        this.data = {};         //船本身的数据

        this.stateTriggerMap = {};
        this.selfTrigger = {};

        this.routeOn = null;
        this.routeIndex = -1;

        this.dockPos = null;

        this.curstate = -1; //IDLE
        this.crash = false;

        this.crashCallBack = ()=>{};
        this.repairCallBack = ()=>{};

        this.SetShipID(_id);
        this.SetShipCagID(_cid);
    }

    initShipMap(){
        this.ShipMap = [
            {
                name:"AAA",
                iconPath:"images/ships/Ship_1_a.png",
                crashIconPath:"images/ships/Ship_1_b.png",
                baseSpeed:[50,130],
                baseLoad:[60,50],
                maxcap:[50,80],
                battle:[20,25],
                repair:[10,8],
                autoRe:[false,true],
                level:[[10,10,10,0],[120,120,120,10]],
                desc:"简介123456YUE",
                rank:0,
                rankWight:250,
                lvlim:2
            },
            {
                name:"BBB",
                iconPath:"images/ships/Ship_2_a.png",
                crashIconPath:"images/ships/Ship_2_b.png",
                baseSpeed:[80,200,220],
                baseLoad:[120,100,80],
                maxcap:[150,200,220],
                battle:[25,30,50],
                repair:[20,10,12],
                autoRe:[true,true,true],
                desc:"第二个船的简介123456Acekasd",
                rank:0,
                rankWight:150,
                lvlim:3
            }
        ];
    }

    SetShipID(_id){
        this.shipID = _id;
        this.data = this.ShipMap[_id];
    }

    GetJobText(){
        if(this.dockid < 0){
            return "仓库中存放……";//显然不会出现在信息中
        }else if(this.routeOn != null){
            if(this.crash){
                return `航道${this.routeOn.curData.name} 受损返航中`;
            }else{
                return `航道${this.routeOn.curData.name} 正常工作中`;
            }
        }else{
            if(this.crash && !this.repair){
                return `船坞中等待修理`;
            }else if(this.repair){
                return `修理中`;
            }else{
                return `船坞中等待任务`;
            }
        }
    }

    SetShipCagID(_cid){
        if(_cid<0)return;

        this.CagID = _cid;
        this.insData = GameDatas.instance.getCagShip(_cid);
        this.SetShipID(this.insData.shipID);

        Object.assign(this,this.insData);

        this.curData = {};
        for(var key in this.data){
            if(this.data.hasOwnProperty(key)){
                if(Object.prototype.toString.call(this.data[key]) === "[object Array]"){
                    this.curData[key] = this.data[key][this.insData.level];
                }else{
                    this.curData[key] = this.data[key];
                }
            }
        }

        this.updateBattleCallBack();
    }

    getCurrentLevel(){
        return this.insData.level + 1;
    }

    getCurrentLevelText(){
        if(this.getCurrentLevel() < this.curData.lvlim){
            return `${this.insData.level + 1}`;
        }else{
            return 'Max';
        }
    }

    initSelfCallBack(){
        this.selfTrigger = {};
    }

    setCrashCallBack(_func){
        this.crashCallBack = _func;
    }

    setRepairCallBack(_func){
        this.repairCallBack = _func;
    }

    getData(key){
        return this.curData[key];
    }

    getNextLvlData(key){
        var array = this.data[key];
        var curLvl = this.getCurrentLevel();
        if(array){
            if(Object.prototype.toString.call(array) === "[object Array]"){
                if(array.length > curLvl)return array[curLvl];
                return array[curLvl - 1];
            }
        }
        return null;
    }

    getIconPath()
    {
        return this.crash ? this.curData.crashIconPath : this.curData.iconPath;
    }

    placeOnRoute(_route){
        this.routeOn = _route;
        this.routeBeforeCrash = null;

        this.initSelfCallBack();
        this.updateBattleCallBack();
    }

    setIdle(){
        if(this.routeOn){
            this.routeOn.loseShip(this);
        }
        
        if(this.dockPos)
            this.dockPos.resumeBusy();

        if(this.crash && this.curData.autoRe){
            this.StartRepair();
            this.routeBeforeCrash = this.routeOn;
        }

        this.routeOn = null;
        this.triggerState(-1);
    }

    isIdle(){
        return this.routeOn == null;
    }

    SetRouteIndex(_index){
        this.routeIndex = _index;
    }

    setStateTrigger(sstate,obj,_func){
        var build = {
            obj:obj,
            func:_func
        };

        if(!this.stateTriggerMap[sstate]){
            this.stateTriggerMap[sstate] = [];
        }

        this.stateTriggerMap[sstate].push(build);
    }

    setSelfTrigger(sstate,_func){
        this.selfTrigger[sstate] = _func;
    }

    triggerState(sstate){

        var kickList = [];
        var allCallBack = this.stateTriggerMap[sstate];

        if(allCallBack){
            
            for(var i=0;i<allCallBack.length;i++){
                var callBack = allCallBack[i];
                if(callBack.obj){
                    var res = callBack.func.call(callBack.obj,this.curstate,this);

                    if(res)kickList.push(i);
                }else{
                    kickList.push(i);
                }
            }

            kickList.reverse();
            for(var index of kickList){
                this.stateTriggerMap[sstate].splice(index,1);
            }
        }

        if(this.selfTrigger[sstate]){
            this.selfTrigger[sstate].call(this);
        }

        this.curstate = sstate;
    }

    sendBack(){
        if(this.curstate == 1 || this.curstate == 2){
            this.moveSet.changeState(3);
            this.setSelfTrigger(4,()=>{
                this.setIdle();
            });

            if(this.dockPos)
                this.dockPos.setSendBack();
        }else if(this.curstate == 3 || this.curstate == 4){
            this.moveSet.changeState(this.curstate);
            this.setSelfTrigger(1,()=>{
                this.setIdle();
            });

            if(this.dockPos)
                this.dockPos.setSendBack();
        }
    }

    /* Battle Wait */
    updateBattleCallBack(){
        this.setSelfTrigger(6,()=>{
            var tempState = this.curstate;
            Laya.timer.frameOnce(120,this,()=>{
                this.curstate = tempState;

                if(Math.random() * this.routeOn.curData.safeMax > this.curData.battle){
                    this.setCrash();
                }else{
                    this.moveSet.reBackInter();
                }
            });
        });
    }

    setCrash(){
        this.crash = true;

        this.crashCallBack();

        if(this.dockPos)
            this.dockPos.setCrashBack();
        this.sendBack();
    }

    StartRepair(){
        if(!this.crash)return;

        this.repair = true;
        this.repairStart = new Date();
        this.repairCallBack();
    }

    repairCompelete(){
        this.repair = false;
        this.repairStart = null;
        this.crash = false;

        if(this.curData.autoRe && this.routeBeforeCrash){
            this.routeBeforeCrash.placeShip(this);

            if(this.dockPos)
                this.dockPos.setBusy();
        }

        this.repairCallBack();
    }
}