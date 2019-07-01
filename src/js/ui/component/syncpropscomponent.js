import Component from 'Skeleton/component';
import { observe } from 'rxjs-observe';

export default class SyncPropsComponent extends Component {
  constructor() {
    super();
    this.syncProps = null;
    this.watchs = null;
  }

  init(body) {
    this.setupWatchs();
    super.init(body);
    this.setupSyncProps()
    return this.delegate;
  }

  setupWatchs(){}
  setupSyncProps(syncProps = null){
    if(this.watchs == null) return;
    if(syncProps != null) {
      this.debuger.log(syncProps, 'setupSyncProps', 0);
      this.syncProps = syncProps;
      let { observables, proxy } = observe(syncProps);
      this.propsObservable = observables;
      this.propsProxy = proxy;
      for(let prop in this.syncProps) {
        this.disposable.push(
          this.propsObservable[prop].subscribe( value => {
            if( this.watchs[prop] != undefined ) this.watchs[prop].call(this,value);
          }));
      }
    }
  }

  onUpdateSyncProps ( syncProps ) {
    if( syncProps == null) return;
    this.debuger.log(syncProps, 'onUpdateSyncProps', 0);
    if(this.syncProps == null) {
      this.setupSyncProps(syncProps);
      return;
    }
    for(var prop in syncProps)  this.onUpdateSyncProp (prop, syncProps[prop]);
  }

  onUpdateSyncProp (prop, value) {
    if(this.syncProps == null) return;
    this.propsProxy[prop] = value;
  }

  remove() {
    super.remove();
    this.syncProps = null;
    this.watchs = null;
    this.propsObservable = null;
    this.propsProxy = null;
  }

}
