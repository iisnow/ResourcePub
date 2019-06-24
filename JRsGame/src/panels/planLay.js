import loadMap from "../libs/nameMap"
import GameDatas from "../manager/GameDatas"
    
export default class PlanLay extends Laya.Panel{
    constructor(){
        super();
    }

    onEnable(){
        loadMap(this,this.content,["dockLev","packLev","buidlLev","selfLev"]);
        
        var _this = this;

        this.dockLev.getChildByName("levelUp").on(Laya.Event.CLICK,this,(event)=>{
            GameDatas.instance.showResAlt("dock",{},{x:event.stageX,y:event.stageY},()=>{
                GameDatas.instance.LevelDockUP();
                _this.refreshLevels();
            });
        });

        this.packLev.getChildByName("levelUp").on(Laya.Event.CLICK,this,(event)=>{
            GameDatas.instance.showResAlt("repair",{},{x:event.stageX,y:event.stageY},()=>{
                GameDatas.instance.LevelPackUP();
                this.refreshLevels();
            });
        });

        this.buidlLev.getChildByName("levelUp").on(Laya.Event.CLICK,this,(event)=>{
            GameDatas.instance.showResAlt("build",{
                handle:"LevelUp"
            },{x:event.stageX,y:event.stageY},()=>{
                GameDatas.instance.LevelBuildUP();
                this.refreshLevels();
            });     
        });

        this.selfLev.getChildByName("levelUp").on(Laya.Event.CLICK,this,(event)=>{
            GameDatas.instance.showResAlt("self",{},{x:event.stageX,y:event.stageY},()=>{
                GameDatas.instance.LevelSelfUP();
                this.refreshLevels();
            });
        });

        this.levelTexts = [
            this.dockLev.getChildByName("level"),
            this.packLev.getChildByName("level"),
            this.buidlLev.getChildByName("level"),
            this.selfLev.getChildByName("level")
        ];
        this.refreshLevels();
    }

    refreshLevels(){
        var allLevels = GameDatas.instance.levelAll;

        this.levelTexts[0].text = `Lev:${allLevels.dock}`;
        this.levelTexts[1].text = `Lev:${allLevels.repair}`;
        this.levelTexts[2].text = `Lev:${allLevels.build}`;
        this.levelTexts[3].text = `Lev:${allLevels.command}`;
    }
}