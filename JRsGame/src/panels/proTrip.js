import loadMap from "../libs/nameMap"

export default class ProTrip extends Laya.Panel{
    constructor(){
        super();

        this.tripMap = [];
        this.showing = false;
        this.ship = null;
    }

    onEnable(){
        loadMap(this,this.content,["baseBG","proName"]);
        loadMap(this,this.baseBG,["proCur","proNextDec","proNextAdd"]);

        this.showing = true;
        this.refreshContent();
    }

    refreshPro(_shipSet){
        this.ship = _shipSet;
        this.refreshContent();
    }

    refreshContent(){
        this.proName.text = this.proText;
        
        if(this.ship){
            var curValue = this.ship.getData(this.proConnect);
            var nextValue = this.ship.getNextLvlData(this.proConnect);

            var curLen = this.proCalc(curValue) * 200 + 10;
            var nextLen = this.proCalc(nextValue) * 200 + 10;

            if(curLen < nextLen){
                this.proCur.width = curLen;
                this.proNextAdd.width = nextLen;
            }else if(curLen > nextLen){
                this.proNextDec.width = curLen;
                this.proCur.width = nextLen;
            }else{
                this.proCur.width = curLen;
            }

            this.proCur.visible = true;
            this.proNextAdd.visible = curLen < nextLen;
            this.proNextDec.visible = curLen > nextLen;
        }
    }

    setProName(_text){
        this.proText = _text;

        if(this.showing)
            this.refreshContent();
    }
    
    setProConnect(_text,_lenfunc){
        this.proConnect = _text;
        this.proCalc = _lenfunc;

        if(this.showing)
            this.refreshContent();
    }
}