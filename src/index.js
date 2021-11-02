
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { connect, Provider } from 'react-redux';
import './index.css';
//import App from './App';
import $ from 'jquery';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";


//constant
//PANEL

const POWER = "POWER";
const PADVOLUME = "PADVOLUME";

//DRUMPADS
const PAD = "PAD";
const PADPACK = "PADPACK";

let loopaudio = null;

const DRUMSPACK = {
  Q : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911581/FCC_Asset/soft-sounding-open-hat-sample-b-key-01-N65_f7jede.mp3',str:'open hat'},
  W : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911583/FCC_Asset/soft-sounding-open-hat-one-shot-a-key-04-90A_uoz6rd.mp3',str:'soft open hat'},
  E : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911581/FCC_Asset/studio-hihat-sound-a-key-14-ISz_oovsv3.mp3',str:'hihat'},
  A : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911582/FCC_Asset/perfect-steel-snare-drum-a-key-166-6f7_cvzrcr.mp3',str:'snare drum'},
  S : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911582/FCC_Asset/hi-tom-a-sharp-key-05-pFN_cfqrbh.mp3',str:'hi tom'},
  D : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911582/FCC_Asset/clean-bass-drum-a-key-104-9NS_pg6kgo.mp3',str:'clean bass'},
  Z : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911582/FCC_Asset/warm-kick-drum-single-shot-a-key-102-sLA_dcubi7.mp3',str:'warm kick drum'},
  X : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911582/FCC_Asset/rich-mids-kick-drum-single-hit-a-key-142-erD_xo05nf.mp3',str:'rich kick drum single'},
  C : {wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633911582/FCC_Asset/acoustic_wood_shaker_one_shot_5A1_fgq23k.mp3',str:'shaker'},
}
const OTHERSPACK = {
  Q : {wav:'Owav1',str:'Owav1'},
  W : {wav:'Owav2',str:'Owav2'},
  E : {wav:'Owav3',str:'Owav3'},
  A : {wav:'Owav4',str:'Owav4'},
  S : {wav:'Owav5',str:'Owav5'},
  D : {wav:'Owav6',str:'Owav6'},
  Z : {wav:'Owav7',str:'Owav7'},
  X : {wav:'Owav8',str:'Owav8'},
  C : {wav:'Owav9',str:'Owav9'},
}
const LOOPSPACK = [{wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633870428/FCC_Asset/aluminium_surdo_big_sound_68y_t9glh2.wav',str:'Aluminium Surdo Big Sound 68'},{wav:'https://res.cloudinary.com/dzr5gin3o/video/upload/v1633919037/FCC_Asset/titan_natural_harp_traditional_sequence_yi6_zq6nn4.mp3',str:'Titan Natural Harp Traditional'},]

const PADSTATE = {
  pad : '',
  padpack: DRUMSPACK,
  padvolume: 0.5,
  power: true,
};
const SYSTEMSTATE = {
  looprunning: false,
  loopselect : LOOPSPACK[0]['wav'],
  power: true,
  pad: '',
};
const DRUMSTATE = {
  //nothing
};
const MINVOLUME = 0;
const MAXVOLUME = 100;
const STEPVOLUME = 1;

//create strict Object
//immutable :|
/*strictObj = (obj) => {
  "use strict";
  return Object.freeze(Object.assign({}, obj));
};
*/
//Redux
//Redux Actions
// pad: pad,wav
// volume: button,wav

const actionPad = (pad) => {
  return {
    type: PAD,
    pad: pad
  };
};
const actionPadPack = (padpack) => {
  return {
    type: PADPACK,
    padpack: padpack,
  }
};
const actionPadVolume = (padvolume) => {
  return {
    type: PADVOLUME,
    padvolume: padvolume,
  }
};
const actionPower = (power) => {
  return {
    type: POWER,
    power: power,
  }
}
//Redux Reducer
//i should only use 1, but i will use combinedreducer still

const systemReducer = (state = PADSTATE, action) => {
  const newState = Object.assign({}, state);
  switch (action.type) {
    case PAD:
      newState.pad = action.pad;
      return newState;
    case PADPACK:
      newState.padpack = action.padpack==='DRUMS'?DRUMSPACK:OTHERSPACK;
      return newState;
    case PADVOLUME:
      newState.padvolume = action.padvolume;
      return newState;
    case POWER:
      newState.power = action.power;
      return newState;
    default:
      return state;
  }
};

//React Redux
const rootReducer = combineReducers({
  system: systemReducer
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

//React Redux


//React
//Apps - Drum Pads & Panel
class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = SYSTEMSTATE;
  }


  /*-https://github.com/mdn/webaudio-examples/blob/master/audio-basics/index.html-*/
  createAudioContext = (audio,volume) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const track = audioCtx.createMediaElementSource(audio);
    // volume
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;
    // panning
    const pannerOptions = { pan: 0 };
    const panner = new StereoPannerNode(audioCtx, pannerOptions);
    panner.pan.value = .5;

    // connect our graph
    track.connect(gainNode).connect(panner).connect(audioCtx.destination);
    return audioCtx;
  }

  createOptions = (pack) => {
    const loops = [];
    pack.forEach(loop => loops.push(<option key={loop.wav} value={loop.wav}>{loop.str}</option>))
    return loops;
  }

  selectloop = (event) => {
    this.setState({ loopselect : event.target.value });
    $('#loopaudio').prop('src',this.state.loopselect);
    this.setState({looprunning:false});
  }

  clickbutton = (event) => {
      switch (event.target.id){
        case 'loopbtn':
          if (!this.props.state.system.power)return;
          if (loopaudio.state==='suspended')loopaudio.resume();
          if (this.state.looprunning===false){
            $('#loopaudio')[0].play();
            this.setState({looprunning:true});
          } else {
            $('#loopaudio')[0].pause();
            this.setState({looprunning:false});
          }
          break;
        case 'powerbtn':
          this.props.dispatchPower(!this.props.state.system.power);
          if (!$('#loopaudio')[0].paused){
            $('#loopaudio')[0].pause();
            $('#loopaudio')[0].currentTime=0;
            this.setState({looprunning:false});
          }
          break;
        default:
          break;
      }

  }

  setvolume = () => {
    const mastervolume = $('#mastervolume').prop('value')/100;
    const loopvolume = $('#loopvolume').prop('value')/100;
    const padvolume = $('#padvolume').prop('value')/100;
    $('#loopaudio')[0].volume = loopvolume*mastervolume;
    this.props.dispatchPadVolume(padvolume*mastervolume);
  }

  componentDidMount(){
    this.setvolume();
    loopaudio = this.createAudioContext($('#loopaudio')[0],1); //1 is the super master volume for the audio context
    $('#mastervolume').on('change', this.setvolume);
    $('#loopvolume').on('change', this.setvolume);
    $('#padvolume').on('change', this.setvolume);
    $('#loopselect').on('change', this.selectloop);
    $('#powerbtn').on('click',this.clickbutton);
    $('#loopbtn').on('click',this.clickbutton);
    $('#padsdrumsbtn').on('click',this.clickbutton);
    $('#padsothersbtn').on('click',this.clickbutton);
  }

  render() {
    return (
      <div id="panel" className="flex-fill container gy-6">
        <div id="panelhead" className="row p-1 gx-0 d-flex align-items-center justify-content-center">
            <div className="col-7 row">
              <div id="drumpadname" className="">ドラムパッド-3000</div>
              <div className="rainbow">-----------------------________-----</div>

            </div>
            <div id="drumedition" className="col  d-flex align-items-center justify-content-center">Simple Edition</div>
            <div className="col d-flex justify-content-end">
              <input type='checkbox' id="powerbtnactive"/>
              <label htmlFor="powerbtnactive" id="powerbtn" className="d-flex align-items-center justify-content-center" >
                <div id="powercover" />
                <div className="padpowerbtn d-flex align-items-center justify-content-center">
                  <svg id="svgpowerbtn" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-power" viewBox="0 0 16 16">
                    <path d="M7.5 1v7h1V1h-1z"/>
                    <path d="M3 8.812a4.999 4.999 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812z"/>
                  </svg></div>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </label>
           </div>
        </div> {/*end panel power*/}
        <div id="panelmastervolume" className="row">
          <div>Master Volume</div>
          <input id="mastervolume" type="range" className="range-question" name="capability" min={MINVOLUME} max={MAXVOLUME} values={this.state.mastervolume} step={STEPVOLUME}/>
        </div>{/*end panel mastervolume*/}
        <div id="panelloop" className="row gx-1">
          <div>Loop</div>
          {/*inside is not working properly!*/}
          <div className="col-2 d-flex align-items-center justify-content-center">
            <span id="loopbtn" className="d-flex align-items-center justify-content-center"><div className="insidepowerbtn d-flex align-items-center justify-content-center">
              {this.state.looprunning?<i className="bi bi-pause"></i>:<i className="bi bi-play"></i>}
              <audio crossOrigin="anonymous"  id='loopaudio' volume={this.state.loopvolume} loop>
  <source src={this.state.loopselect} type="audio/wav" preload="auto"/></audio></div>
          </span></div>
          <div className="col gy-1">
            <select id="loopselect" className="" defaultValue={this.state.loopselect}>
              {this.createOptions(LOOPSPACK)}
            </select>
            <input id="loopvolume" type="range" className="range-question" name="capability" min={MINVOLUME} max={MAXVOLUME} values={this.state.loopvolume} step={STEPVOLUME}/>
          </div>
         </div>{/*end panel loop*/}
        <div id="panelpads" className="row gx-1">
          <div className="row">Pads</div>
          <div className="row gx-4">
            <div className="col-6">
              <div id="display"><p className="mx-1">{this.props.state.system.pad}</p></div>
              <input id="padvolume" type="range" className="range-question" name="capability" min={MINVOLUME} max={MAXVOLUME} values={this.state.padvolume} step={STEPVOLUME}/>
            </div>
            <div className="col-6">
              <div className="drumothers">
                  <div id="padsdrumsbtn" className="d-flex align-items-center justify-content-center"><div className="insidepowerbtn d-flex align-items-center justify-content-center">drums</div></div>
                  <div id="padsothersbtn" className="d-flex align-items-center justify-content-center"><div className="insidepowerbtn d-flex align-items-center justify-content-center">others</div></div>
              </div>
            </div>
          </div>
        </div> {/*end panel pads*/}
      </div>
    );
  }
}

class DrumPads extends React.Component {
  constructor(props) {
    super(props);
    this.state = DRUMSTATE;
  }

  playaudio(key,pad) {
    if (!this.props.state.system.power)return;
    const audio = $('#'+key)[0];
    if (!audio.paused) audio.currentTime = 0;
    audio.volume = this.props.state.system.padvolume;
    audio.play();
    this.props.dispatchPad(pad)
  }
  clickpad = (event) => {
    this.playaudio(event.target.textContent,event.target.id);
  }
  keydown = (event) => {
    const keys = 'qweasdzxc';
    if (keys.indexOf(event.key.toLowerCase()) > -1) {
     this.playaudio(event.key.toUpperCase(),$('#'+event.key.toUpperCase())[0].parentElement.id);
    } //event.key in keys
  }

  componentDidMount(){
      document.querySelector('#drumpads').querySelectorAll('div').forEach((item,index)=>{
      const padpack = this.props.state.system.padpack;
      const pad = padpack[Object.keys(padpack)[index]];
      item.setAttribute('id',pad.str.split(' ').join('_'));
        $('#'+item.id).on('click',this.clickpad)
    });

      $(document).on('keydown',this.keydown);
 }

  render() {
    return (
      <div id="drumpads" className="">
         <div className="drum-pad p-2">Q<audio crossOrigin="anonymous" id="Q" className="clip" src={this.props.state.system.padpack.Q.wav}/></div>
         <div className="drum-pad p-2">W<audio id="W" crossOrigin="anonymous" className="clip" src={this.props.state.system.padpack.W.wav}/></div>
         <div className="drum-pad p-2">E<audio id="E" crossOrigin="anonymous" className="clip" src={this.props.state.system.padpack.E.wav}/></div>
         <div className="drum-pad p-2">A<audio id="A" crossOrigin="anonymous" className="clip" src={this.props.state.system.padpack.A.wav}/></div>
         <div className="drum-pad p-2">S<audio id="S" crossOrigin="anonymous" className="clip" src={this.props.state.system.padpack.S.wav}/></div>
         <div className="drum-pad p-2">D<audio id="D" crossOrigin="anonymous" className="clip" src={this.props.state.system.padpack.D.wav}/></div>
         <div className="drum-pad p-2">Z<audio id="Z" crossOrigin="anonymous" className="clip" src={this.props.state.system.padpack.Z.wav}/></div>
         <div className="drum-pad p-2">X<audio id="X" crossOrigin="anonymous" className="clip" src={this.props.state.system.padpack.X.wav}/></div>
         <div className="drum-pad p-2">C<audio id="C" crossOrigin="anonymous" className="clip" src={this.props.state.system.padpack.C.wav}/></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { state: state };
};
const mapDispatchToProps = (dispatch) => {
  return {
    dispatchPad: (pad) => {
      dispatch(actionPad(pad));
    },
    dispatchPadPack: (padpack) => {
      dispatch(actionPadPack(padpack));
    },
    dispatchPadVolume: (padvolume) => {
      dispatch(actionPadVolume(padvolume));
    },
    dispatchPower: (power) => {
      dispatch(actionPower(power));
    },
  };
};

const DrumPadsDisplay = connect(mapStateToProps, mapDispatchToProps)(DrumPads);
const PanelDisplay = connect(mapStateToProps, mapDispatchToProps)(Panel);

class Wrapper extends React.Component {

  render() {
    return (
      <Provider id="provider" store={store}>
        <div id="drum-machine" className="d-flex flex-row justify-content-center align-items-center">
          <DrumPadsDisplay />
          <PanelDisplay />
        </div>
      </Provider>
    );
  }
}

ReactDOM.render(<Wrapper />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
