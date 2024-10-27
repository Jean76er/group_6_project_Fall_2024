import SillySharkPlayer from "./SillySharkPlayer";
import InvalidParametersError from '../../lib/InvalidParametersError';
import * as paramerrors from '../../lib/InvalidParametersError';
import Game from './Game';
import {SillySharkGameState} from '../../types/CoveyTownSocket';

export default class SillySharkGame extends Game <SillySharkGameState> {

    public _join (player: SillySharkPlayer){
        if(this.state.player1 === player.id){
            this.state.player1 = undefined;
        }  
    }
    public _leave(player: SillySharkPlayer){
        /* Delete this when implementing */
        if(this.state.player1 === player.id){
            this.state.player1 = undefined;
        }
    }
}