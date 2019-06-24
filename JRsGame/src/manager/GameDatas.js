import BigNumber from "../libs/bignumber.js"

import Resource from "../data/resource"
import Dock from "../data/dock"
import Route from "../data/route"
import Ship from "../data/ship"
import BuildList from "../data/buildSet"
    
export default class GameDatas{
    
    constructor(){
        GameDatas.instance = this;

        this.curResource = new Resource();
        this.dock = new Dock(0);

        this.allRoutes = [];
        this.currentRoute = 0;
        this.unlockCount = 1;

        this.cagShips = {};     //服务器记录的船数据，ID根据获得先后确定
        this.packShips = [];    //仓库中的船

        this.buildList = {};
        this.buildCap = 2;
        this.buildLevel = 1;

        this.sceneEventMap = {};

        this.levelAll = {
            dock:1,
            repair:1,
            build:1,
            command:1
        };

        this.repairNeed = [
            []
        ];

        this.buildNeed = [
            []
        ];

        this.selfNeed = [
            []
        ];

        this.buildLvl = [
            []
        ];

        this.debug();
        this.init();
    }

    init(){
        this.initAllShipCarry();
    }

    debug(){
        var routeTest = new Route(0,0);
        var routeTestLev = new Route(1,0);
        var routeTestLas = new Route(2,0);

        this.unlockCount = 1;

        this.allRoutes.push(routeTest);
        this.allRoutes.push(routeTestLev);
        this.allRoutes.push(routeTestLas);

        this.cagShips[0] = {
            shipID:0,
            level:0,
            dockid:0,
            rid:-1,
            packID:0
        };
        this.cagShips[1] = {
            shipID:1,
            level:0,
            dockid:1,
            rid:-1,
            packID:0
        };
        this.cagShips[2] = {
            shipID:0,
            level:0,
            dockid:-1,
            rid:-1,
            packID:0
        };
        this.cagShips[3] = {
            shipID:1,
            level:0,
            dockid:-1,
            rid:-1,
            packID:1
        };
        this.cagShips[4] = {
            shipID:1,
            level:0,
            dockid:-1,
            rid:-1,
            packID:2
        };
        this.cagShips.count = 5;

        this.dock.dockSet[0] = new Ship(0,0);
        this.dock.dockSet[1] = new Ship(1,1);

        this.packShips.push(new Ship(0,2));
        this.packShips.push(new Ship(1,3));
        this.packShips.push(new Ship(1,4));

        this.buildLevel = 3;
    }

    GetRepairFix(){
        return 1 / Math.sqrt(this.levelAll.repair);
    }

    LevelDockUP(){
        this.levelAll.dock++;
        this.dock.LevelUP();

        this.triggerSceneEvent("dock:lvlup");
        this.triggerSceneEvent("dock:full");
    }

    LevelPackUP(){
        this.levelAll.repair++;
    }

    LevelBuildUP(){
        this.levelAll.build++;
        this.buildCap++;
        this.triggerSceneEvent("build:lvlup");
    }

    LevelSelfUP(){
        this.levelAll.command++;
    }

    addResChangeCallBack(_func,key){
        this.curResource.addChangeCallBack(_func,key);
    }

    getRouteUnlockCount(){
        return Math.min(this.allRoutes.length,this.unlockCount + 1);
    }

    GetAllRouter(){
        var routText = "";

        var watchRoute = this.allRoutes.slice(0,this.unlockCount + 1);
        for(var route of watchRoute)
            routText += `${route.curData.name},`;
        return routText.slice(0,-1);
    }

    getCurrentRoute(){
        return this.allRoutes[this.currentRoute];
    }

    upShipToCurrentRoute(posIndex){
        if(this.currentRoute >= this.unlockCount)return;
        var _shipSet = this.dock.dockSet[posIndex];
        if(_shipSet.crash || _shipSet.routeOn != null)return;

        var route = this.allRoutes[this.currentRoute];

        if(route.shipFull())return;

        route.placeShip(_shipSet);
        this.dock.outShip(posIndex);
    }

    onSceneEvent(key,_func){
        this.sceneEventMap[key] = _func;
    }

    triggerSceneEvent(){
        var len = arguments.length;
        var args = [];
        for(var i=0;i<len;i++)
            args.push(arguments[i]);

        var key = args[0];
        args.splice(0,1);

        if(this.sceneEventMap[key]){
            this.sceneEventMap[key].apply(this,args);
        }
    }

    changeShipPos(pindex1,pindex2){
        if(pindex1 == pindex2)return false;

        var ship1 = this.dock.dockSet[pindex1];
        var ship2 = this.dock.dockSet[pindex2];

        if(ship2 == null){
            if(ship1 == null || !ship1.isIdle() || ship1.repair)return false;
            this.dock.dockSet[pindex1] = null;
            this.dock.dockSet[pindex2] = ship1;
            ship1.dockid = pindex2;
            return true;
        }else if(ship1.isIdle() && ship2.isIdle() && !ship1.repair && !ship2.repair){
            this.dock.dockSet[pindex1] = ship2;
            this.dock.dockSet[pindex2] = ship1;
            ship1.dockid = pindex2;
            ship2.dockid = pindex1;
            return true;
        }

        return false;
    }

    backShip(posIndex){
        var ship = this.dock.GetShipSet(posIndex);
        ship.sendBack();
    }

    dropShip(posIndex){
        var ship = this.dock.GetShipSet(posIndex);
        ship.setIdle();
        this.dock.dropShip(posIndex);
    }

    getCagShip(cid){
        return this.cagShips[cid];
    }

    initAllShipCarry(){
        var dockSet = this.dock.dockSet;
        for(var index in dockSet){
            if(dockSet.hasOwnProperty(index)){
                var ship = dockSet[index];
                ship.setStateTrigger(1,this,(pstate,shipSet)=>{
                    if(pstate != 0){
                        this.GetPackResource(shipSet);
                    }
                    return false;
                })
            }
        }
    }

    GetPackResource(_shipSet){
        var route = _shipSet.routeOn;
        if(route == null)return;

        var resGain = new Resource();
        resGain.randomResouce(route.curData.resource,_shipSet.curData.maxcap);

        this.curResource.resourceChange(resGain.buildObj());
    }

    showShipInfo(pindex){
        var ship = this.dock.dockSet[pindex];
        if(!ship)return;

        this.triggerSceneEvent("scene:info",ship);
        this.infoShip = ship;
    }

    closeInfo(){
        this.triggerSceneEvent("scene:infoclose");
        this.infoShip = null;
    }

    lvlInfoShip(){
        if(this.infoShip == null)return;
        /*Cost*/
        var cagID = this.infoShip.CagID;

        this.cagShips[cagID].level++;
        this.infoShip.SetShipCagID(cagID)

        this.triggerSceneEvent("ship:lvlup",this.infoShip);
    }

    changeRouteShow(rindex){
        this.currentRoute = rindex;
    }

    getRouteByIndex(rindex){
        return this.allRoutes[rindex];
    }

    UnlockRoute(){
        if(this.unlockCount < this.allRoutes.length - 1){
            this.unlockCount ++;
            this.triggerSceneEvent("route:unlock",this.unlockCount);
        }else{
            this.unlockCount ++;
            this.triggerSceneEvent("route:unlock");
        }
    }

    repairShip(pindex){
        var ship = this.dock.dockSet[pindex];
        if(!ship || !ship.crash)return;

        ship.StartRepair();
    }

    PackAutoIn(shipSet){
        this.packShips.push(shipSet);
        this.refreshAllPackID(shipSet);
        this.triggerSceneEvent("pack:collect",shipSet);
    }

    recollectShip(pindex){
        var ship = this.dock.dockSet[pindex];
        if(!ship || ship.crash)return;

        this.PackAutoIn(ship);
        this.dock.dockSet[pindex] = null;

        this.triggerSceneEvent("dock:pack",pindex);
    }

    TriggerBuildOK(){
        this.triggerSceneEvent("build:trigger");
    }

    refreshAllPackID(shipSet){
        if(shipSet){
            shipSet.packID = this.packShips.length - 1;
        }else{
            for(var index = 0;index < this.packShips.length;index++){
                this.packShips[index].packID = index;
            }
        }
    }

    DockAutoIn(shipSet){
        var dockCap = this.dock.GetShipCap();
        for(var index = 0;index < dockCap;index++){
            var dockPos = this.dock.dockSet[index];
            if(dockPos == null){
                this.dock.dockSet[index] = shipSet;
                shipSet.dockid = index;
                shipSet.setIdle();
                this.triggerSceneEvent("dock:insert",shipSet);
                break;
            }
        }
    }

    SendShipToDock(shipSet){
        if(shipSet.packID>=0)
            this.packShips.splice(shipSet.packID,1);
        
        this.DockAutoIn(shipSet);

        shipSet.packID = -1;
        this.refreshAllPackID();

        if(this.CheckDockFull()){
            this.triggerSceneEvent("dock:full");
        }
    }

    CheckDockFull(){
        var dockCap = this.dock.GetShipCap();
        var count = 0;
        for(var index = 0;index < dockCap;index++){
            var dockPos = this.dock.dockSet[index];
            if(dockPos != null)count++;
        }
        return count == dockCap;
    }

    StartBuild(_lev){
        var build = new BuildList(_lev);
        return build;
    }

    gainShip(buildList){
        var ShipSet = buildList.getBuildResult();
        this.cagShips[this.cagShips.count]=({
            shipID:ShipSet.shipID,
            level:0,
            dockid:-1,
            rid:-1,
            packID:-1
        });
        var cagID = this.cagShips.count;
        ShipSet.SetShipCagID(cagID);

        this.cagShips.count++;
        return ShipSet;
    }

    showResAlt(key,c_data,pos,_func){
        var resNeed;
        if(key=="ship"){
            var shipSet = c_data.obj;
            resNeed = new Resource(shipSet.curData.level);
        }else if(key=="route"){
            var route = c_data.obj;
            var handle = c_data.handle;//"Unlock,LevelUp"
            if(handle == "Unlock")
            {
                resNeed = new Resource(route.curData.unlock);
            }else if(handle == "LevelUp"){
                resNeed = new Resource(route.curData.level);
            }
        }else if(key=="build"){
            var rank = c_data.rank;
            var handle = c_data.handle;//"Build,LevelUp"
            if(handle == "Build"){
                resNeed = new Resource(this.buildNeed[rank]);
            }else if(handle == "LevelUp"){
                resNeed = new Resource(this.buildLvl[rank]);
            }
        }else if(key=="dock"){
            resNeed = new Resource(this.dock.levelUp);
        }else if(key=="repair"){
            var rank = c_data.rank;
            resNeed = new Resource(this.repairNeed[rank]);
        }else if(key=="self"){
            var rank = c_data.rank;
            resNeed = new Resource(this.selfNeed[rank]);
        }

        var ok = this.curResource.checkResource(resNeed);

        var _this = this;
        this.triggerSceneEvent("res:alt",pos,resNeed,ok,()=>{
            _this.curResource.costRes(resNeed);
            _func();
        });
    }
}
