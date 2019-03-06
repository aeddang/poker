import Component from 'Skeleton/component';
import { observe } from 'rxjs-observe';



export default class SyncPropsComponent extends Component {
  constructor() {
    super();
    this.syncProps = {};
    this.watchs = null;
  }

  init(body) {
    this.setupSyncProps();
    return super.init(body);
  }

  onUpdateSyncProps ( syncProps ) {
    for(var prop in syncProps)  this.onUpdateSyncProp (prop, syncProps[prop]);
  }

  onUpdateSyncProp (prop, value) {
    if( this.syncProps[prop] != undefined ) { this.propsProxy[prop] = value; }
  }

  setupSyncProps(){
    let { observables, proxy } = observe(this.syncProps);
    this.propsObservable = observables;
    this.propsProxy = proxy;
  }

  setupSubscription(){
    for(let prop in this.syncProps) {
      this.disposable.push(
        this.propsObservable[prop].subscribe( value => {
          this.watchs[prop].call(this,value);
        }));
    }
    super.setupSubscription();
  }

  remove() {
    super.remove();
    this.syncProps = null;
    this.watchs = null;
    this.propsObservable = null;
    this.propsProxy = null;
  }

}
