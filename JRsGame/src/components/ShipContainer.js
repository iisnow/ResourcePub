import RepeatMove from "../components/repeatMove"

export default class ShipContainer extends Laya.Script{
    /** @prop {name:shipPre,tips:"航行船",type:Prefab} */
    /** @prop {name:shipY,tips:"航行船Y坐标",type:Int} */

    constructor(){
        super();

        this.shipArr = [];
        this.count = 0;
        this.index = 0;
    }

    addShip(_shipSet){
        var shipFab = this.shipPre.create();
        shipFab.skin = _shipSet.getIconPath();

        this.owner.addChild(shipFab);
        var moveSet = shipFab.getComponent(RepeatMove);
        _shipSet.moveSet = moveSet;

        var textMap = ["SATRT","FORWARD","PACKIN","BACK","PAKCOUT"];
        for(var i =- 2;i < 7;i++){
            moveSet.setStateCallBack(i,(ps,cs)=>{
                if(_shipSet.dockPos && cs >= 0 && cs <= 4)
                    _shipSet.dockPos.setWorkState(textMap[cs]);
                if(cs == 6)
                    _shipSet.dockPos.setWorkState("BATTLE");
                _shipSet.triggerState(cs);
            });
        }

        _shipSet.setCrashCallBack(()=>{
            _shipSet.dockPos.refreshState();
            shipFab.skin = _shipSet.getIconPath();
        });

        _shipSet.setRepairCallBack(()=>{
            _shipSet.dockPos.refreshState();
        });

        shipFab.y = this.shipY;

        _shipSet.SetRouteIndex(this.index);
        this.shipArr.push({
            ID:this.index++,
            ship:shipFab,
            moveSet:moveSet,
            shipset:_shipSet
        });

        this.count++;
        moveSet.setBlank();
    }

    loseShip(_shipSet){
        for(var i=0;i<this.shipArr.length;i++){
            var obj = this.shipArr[i];
            if(obj.shipset == _shipSet){
                this.owner.removeChild(obj.ship);
                
                this.count--;
                this.shipArr.splice(i,1);

                _shipSet.SetRouteIndex(-1);
                break;
            }
        }
    }

    setAllShip(arr){
        this.owner.removeChildren();

        this.shipArr = [];
        this.count = 0;
        this.index = 0;

        for(var ship of arr){
            this.addShip(ship);
        }
    }

    eachConfig(_func){
        for(var obj of this.shipArr){
            _func(obj);
        }
    }

    fixIDConfig(ID,_func){
        for(var obj of this.shipArr){
            if(obj.ID==ID) 
            {
                _func(obj);
                break;
            }
        }
    }
}   