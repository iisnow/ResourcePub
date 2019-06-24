
export default class GameData{

    static GetInstance(){
        if(!GameData.instance)
            GameData.instance = new GameData();
        return GameData.instance;
    }

    constructor(){
        this.gameConfig = {
            maxPlayer:4,
            AIFix:true,
            AICount:3,
            curPlayer:1
        };

        this.boradDatas = {
            count:100,
            width:6,
            random:true,
            datas:[]
        }

        GameData.instance = this;
    }

}