import GameDatas from "../manager/GameDatas"
import Dock from "../data/dock"

export default class SceneLayer extends Laya.Script{
    /** @prop {name:dockPos,tips:"使用的船位Panel",type:Prefab} */
    /** @prop {name:routeLay,tips:"航道使用的Panel",type:Prefab} */
    /** @prop {name:proTrips,tips:"属性使用的Panel",type:Prefab} */
    /** @prop {name:deskTrip,tips:"仓库使用的Panel",type:Prefab} */
    /** @prop {name:buildTrip,tips:"建造使用的Panel",type:Prefab} */
    /** @prop {name:resAlt,tips:"资源窗使用的Panel",type:Prefab} */

    constructor(){
        super();
    }

    setAltLayer(){
        this.altRes = this.resAlt.create();
        this.owner.addChild(this.altRes);

        this.altRes.zOrder = 500;
        this.altRes.visible = false;
        this.altRes.pos(-150,-150);

        this.cover = this.owner.AllCov;
        this.cover.on(Laya.Event.CLICK,this,(event)=>{
            event.stopPropagation();
        });

        this.cover.visible = false;

        var _this = this;
        this.altRes.cancelCallBack = (event)=>{
            _this.altRes.visible = false;
            _this.altRes.pos(-150,-150);
            _this.cover.visible = false;
        }
    }

    setRoutePanel(layer){
        this.curRouter = layer;
        this.routes = [];

        this.refreshAllRouters();
        this.refreshRouterZorder();
    }

    setDockPanel(layer){
        this.dockPanel = layer;
        this.poses = [];

        this.refreshAllPoses();
        this.dragCallback = ()=>{};
    }

    setInfoPanel(layer){
        this.infoPanel = layer;
        this.infos = [];

        var pros = [
            {name:"speed",proName:"baseSpeed",lenfunc:(num)=>{
                return num / 500;
            }},
            {name:"steve",proName:"baseLoad",lenfunc:(num)=>{
                return 20 / (num + 1);
            }},
            {name:"capacity",proName:"maxcap",lenfunc:(num)=>{
                return num / 1000;
            }},
            {name:"power",proName:"battle",lenfunc:(num)=>{
                return num / 300;
            }},
            {name:"repair",proName:"repair",lenfunc:(num)=>{
                return 4 / (num + 1);
            }}
        ];

        this.refreshAllPros(pros);
    }

    setDeskPanel(layer){
        this.deskLay = layer;
        this.desks = [];

        this.refreshAllDeskes();
    }

    setBuildPanel(layer){
        this.buildLay = layer;
        this.buildTrips = [];

        this.refreshAllBuilds();
    }

    setDragCallback(_func){
        this.dragCallback = _func;
    }

    refreshAllRouters(){
        var count = GameDatas.instance.getRouteUnlockCount();
        var current = GameDatas.instance.currentRoute;

        for(var index = 0;index < count;index ++){
            if(index != current){
                this.unlockRoute(index);
            }
        }

        this.curRouter.routeIndex = current;
        this.routes.push(this.curRouter);
    }

    refreshRouterZorder(){
        var current = GameDatas.instance.currentRoute;
        
        for(var lay of this.routes){
            if(lay.routeIndex == current){
                lay.zOrder = 10;
                lay.visible = true;
            }else{
                lay.zOrder = 0;
                lay.visible = false;
            }
        }
    }   

    unlockRoute(index){
        var route = this.routeLay.create();
        route.pos(this.curRouter.x,this.curRouter.y);

        route.routeIndex = index;
        route.setRoute(GameDatas.instance.getRouteByIndex(index));

        this.curRouter.parent.addChild(route);
        this.routes.push(route);
    }

    updateRoute(index){
        for(var lay of this.routes){
            if(lay.routeIndex == index){
                lay.refreshRoute();
            }
        }
    }

    refreshAllPoses(){
        var curDock = GameDatas.instance.dock;

        for(var i=0;i<curDock.GetShipCap();i++){
            this.insertPos(i,curDock.GetShipSet(i));
        }

        var _this = this;
        curDock.setDockCallBack((flag,index)=>{
            if(flag == "busy"){
                _this.poses[index].setBusy();
            }else if(flag == "resume"){
                _this.poses[index].resumeBusy();
            }
        });
    }

    insertPos(index,shipSet){
        var posSet = this.dockPos.create();
        posSet.placeShip(shipSet);

        this.poses[index] = posSet;

        var indexPos = this.getPosByIndex(index);
        posSet.pos(indexPos.x,indexPos.y);
        posSet.posIndex = index;

        this.dockPanel.addChild(posSet);

        posSet.setClickCallBack((set)=>{
            if(posSet.busy){
                GameDatas.instance.backShip(posSet.posIndex);
            }
        });

        var _this = this;
        posSet.setdragPlaceCallBack((flag,event)=>{
            event.flag = flag;
            _this.dragCallback(posSet.posIndex,event);

            if(flag == "release" || flag == "hoverOut")
                posSet.backPos();
        })  
    }

    updateAllDockPos(){
        var curDock = GameDatas.instance.dock;
        if(this.poses.length >= curDock.GetShipCap()) return;

        for(var stIndex = this.poses.length;stIndex < curDock.GetShipCap();stIndex ++){
            this.insertPos(stIndex,curDock.GetShipSet(stIndex));
        }
    }

    updateAllBuildTrip(){
        var count = GameDatas.instance.buildCap;
        var tripNum = this.buildTrips.length;

        for(var index = tripNum;index<count;index++){
            var trip = this.buildTrip.create();
            this.buildLay.addChild(trip);
            trip.pos(0,205 * index);
            this.buildTrips.push(trip);
        }
    }

    insertDockPos(shipSet){
        var index = shipSet.dockid;
        this.poses[index].placeShip(shipSet);
    }

    refreshAllDeskes(){
        this.curDesk = 0;

        var allShips = GameDatas.instance.packShips;
        var count = allShips.length;

        for(var index=0;index<count;index+=3){
            var trip = this.deskTrip.create();
            trip.setShip(0,allShips[index]);
            if(++index<count){
                trip.setShip(1,allShips[index]);
            }
            if(++index<count){
                trip.setShip(2,allShips[index]);
            }
            this.desks.push(trip);
            this.deskLay.addChild(trip);
            trip.pos(0,200 * Math.floor(index/ 3));
        }

        this.curDesk = count % 3;
        
        if(count == 0){
            var trip = this.deskTrip.create();
            this.desks.push(trip);
            this.deskLay.addChild(trip);
            trip.pos(0,0);
        }
    }

    refreshAllDeskByOutShip(shipSet){
        if(shipSet.packID < 0)return

        this.curDesk = 0;

        var allShips = GameDatas.instance.packShips;
        var count = allShips.length;
        var stIndex = shipSet.packID;

        for(var index=stIndex;index<allShips.length;index++){
            var tripIndex = Math.floor(index/ 3);
            var trip = this.desks[tripIndex];
            trip.setShip(index % 3,allShips[index]);
        }

        var maxTrip = Math.floor((count-1)/ 3) + 1;

        this.curDesk = count % 3;
        if(this.curDesk != 0){
            var trip = this.desks[maxTrip-1];
            trip.setShip(this.curDesk,null);
            if(this.curDesk == 1)
                trip.setShip(2,null);
        }

        if(this.desks.length >  maxTrip){
            for(var tindex = maxTrip;tindex < this.desks.length;tindex ++){
                this.desks[tindex].destroy();
            }
        }

        this.desks = this.desks.slice(0,maxTrip)
    }

    insertPackShip(shipSet){
        if(this.curDesk == 0){
            var trip = this.deskTrip.create();
            trip.setShip(this.curDesk++,shipSet);
            this.desks.push(trip);
            this.deskLay.addChild(trip);
            trip.pos(0,200 * (this.desks.length - 1));
        }else{
            this.desks[this.desks.length - 1].setShip(this.curDesk++,shipSet);
        }

        this.curDesk = this.curDesk % 3;
    }

    AllDesckRefreshFull(){
        for(var trip of this.desks){
            trip.refreshShow();
        }
    }

    refreshAllBuilds(){
        var count = GameDatas.instance.buildCap;

        for(var index=0;index<count;index++){
            var trip = this.buildTrip.create();
            this.buildLay.addChild(trip);
            trip.pos(0,205 * index);
            this.buildTrips.push(trip);
        }
    }

    buildTripCheck(){
        for(var brip of this.buildTrips){
            brip.resultRefresh();
        }
    }

    getPosByIndex(index){
        return {
            x:200 * index,
            y:(index % 2)*120
        }
    }

    changePos(index1,index2){
        var pos1 = this.poses[index1];
        var pos2 = this.poses[index2];

        var xy1 = {x:pos1.x,y:pos1.y};
        var xy2 = {x:pos2.x,y:pos2.y};

        pos1.posIndex = index2;
        pos2.posIndex = index1;

        this.poses[index1] = pos2;
        this.poses[index2] = pos1;

        pos1.pos(xy2.x,xy2.y);
        pos2.pos(xy1.x,xy1.y);

        pos1.backPos();
        pos2.backPos();
    }

    recollectPos(pindex){
        this.poses[pindex].placeShip(null);
    }

    refreshAllPros(pros){
        var index = 0;
        for(var proset of pros){
            var name = proset.name;
            var proName = proset.proName;

            var proTrip = this.proTrips.create();
            proTrip.pos(25,25 + index * 40);

            this.infoPanel.addChild(proTrip);

            proTrip.setProName(name);
            proTrip.setProConnect(proName,proset.lenfunc);

            this.infos.push(proTrip);

            index++;
        }
    }

    refreshInfoShow(shipset){
        for(var proTrip of this.infos){
            proTrip.refreshPro(shipset);
        }
    }

    showRes(_res,ok,x,y,okCallBack){
        var _this = this;
        this.altRes.okCallBack = ()=>{
            okCallBack();
            _this.altRes.visible = false;
            _this.altRes.pos(-150,-150);
            _this.cover.visible = false;
        };
        this.altRes.visible = true;

        this.altRes.setEnough(ok);

        this.altRes.setResourceShow(_res);

        x = Math.min(480,x);
        y = Math.min(660,y);

        this.altRes.pos(x,y);
        this.cover.visible = true;
    }
}