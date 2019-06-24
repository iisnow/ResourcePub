import ShipContainer from "../components/ShipContainer"
import GameDatas from "../manager/GameDatas"
    
export default class RouteLay extends Laya.Panel{
    constructor(){
        super();

        this.showing = false;
        this.route = null;
    }

    onEnable(){
        this.container = this.content.getChildByName("ShipsPanel");
        this.shipContent = this.container.getComponent(ShipContainer);
        this.RouteBG = this.content.getChildByName("RouteBG");
        this.levelBut = this.content.getChildByName("levelBut");
        this.RouteCover = this.content.getChildByName("cover");

        this.unlockBut = this.RouteCover.getChildByName("unlockBut");
        this.shipCount = this.content.getChildByName("shipCount");

        if(this.route != null){
            this.refreshShips();
            this.refreshRoute();
        }

        this.showing = true;
        this.unlockBut.on(Laya.Event.CLICK,this,(event)=>{
            GameDatas.instance.showResAlt("route",{
                obj:this.route,
                handle:"Unlock"
            },{x:event.stageX,y:event.stageY},()=>{
                GameDatas.instance.UnlockRoute();
            });
        });

        this.levelBut.on(Laya.Event.CLICK,this,(event)=>{
            var _this = this;
            GameDatas.instance.showResAlt("route",{
                obj:this.route,
                handle:"LevelUp"
            },{x:event.stageX,y:event.stageY},()=>{
                _this.route.levelUP();
                _this.refreshRoute();
            });
        });
    }

    setRoute(_route){
        this.route = _route;

        var _this = this;
        this.route.setPlaceCallBack((ship,loseShip)=>{
           if(ship != null){
                _this.GainShip(ship);
                this.shipCount.text = `${this.route.shipCount()}/${this.route.curData.maxShip}`;
           }else{
                _this.LoseShip(loseShip);
                this.shipCount.text = `${this.route.shipCount()}/${this.route.curData.maxShip}`;
           }
        });

        if(this.showing){
            this.refreshShips();
            this.refreshRoute();
        }

    }

    refreshShips(){
        this.createAllShips();
        this.updateShip(-1);
    }

    refreshRoute(){
        this.RouteBG.skin = this.route.curData.backPath;
        this.RouteCover.visible = this.routeIndex >= GameDatas.instance.unlockCount;            
        this.levelBut.visible = !this.route.isMaxLevel();

        this.shipCount.text = `${this.route.shipCount()}/${this.route.curData.maxShip}`;
    }

    createAllShips(){
        this.shipContent.setAllShip(this.route.shipOn);
        var _this = this;
        this.shipContent.eachConfig((obj)=>{
            _this.placeInitConfig(obj);
        })
    }

    placeInitConfig(obj){
        obj.moveSet.configAllData({
            lineLength:this.route.getDistance(),
            safeFix:this.route.curData.safeFix
        });
    }

    updateShip(fixID){
        var _this = this;
        var func = (obj)=>{
            if(obj.shipset.getIconPath())
                obj.moveSet.startMove();
            else
                obj.moveSet.setBlank();
            
            obj.moveSet.configAllData({
                moveSpeed:obj.shipset.getData("baseSpeed"),
                packtime:obj.shipset.getData("baseLoad")
            })
        };
        if(fixID < 0){
            this.shipContent.eachConfig(func);
        }else{
            this.shipContent.fixIDConfig(fixID,func);
        }
    }

    GainShip(ship){
        var _this = this;
        this.shipContent.addShip(ship);
        this.shipContent.fixIDConfig(ship.routeIndex,(obj)=>{
            _this.placeInitConfig(obj);
        })
        this.updateShip(ship.routeIndex);
    }

    LoseShip(ship){
        this.shipContent.loseShip(ship);
    }
}