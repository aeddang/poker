import Velocity from 'velocity-animate';
import Animate from 'animate-value';
import Debugger from './log';
const debuger = new Debugger(this);
debuger.tag = 'Animation';

export function animation(view, options, duration = 300, ease = "easeInSine") {
  Velocity(view,"stop");
  Velocity(view, options, { duration: duration }, ease );
}

//function(elements)
export function animationAndComplete(view, options, complete, duration = 300, ease = "easeInSine") {
  Velocity(view,"stop");
  Velocity(view, options, { complete:complete }, { duration: duration }, ease );
}

//function(elements)
export function animationAndBegin(view, options, begin, duration = 300, ease = "easeInSine") {
  Velocity(view,"stop");
  Velocity(view, options, { begin:begin }, { duration: duration }, ease );
}

//function(elements, complete, remaining, start, tweenValue)
export function animationAndProgress(view, options, progress, duration = 300, ease = "easeInSine") {
  Velocity(view,"stop");
  Velocity(view, options, { progress:progress }, { duration: duration }, ease );
}

export function animationWithHandler(view, options, handler, duration = 300, ease = "easeInSine") {
  Velocity(view,"stop");
  Velocity(view, options, handler, { duration: duration }, ease );
}
/*
av({
  from: 0,
  to: 20,
  easing: 'linear',
  duration: 1000,
  delay: 1000,
  loopDelay: 500,
  loop: true,
  reverse: true

linear
easeInQuad
easeOutQuad
easeInOutQuad
easeInCubic
easeOutCubic
easeInOutCubic
easeInQuart
easeOutQuart
easeInOutQuart
easeInQuint
easeOutQuint
easeInOutQuint
});
*/
export function animationValue(view, attr, targetValue , duration = 300, ease = "easeInQuad", options = {} ) {
  options.from =  view[ attr ];
  options.to = targetValue;
  options.easing = ease;
  options.duration = duration;
  options.change = value => view [ attr ] = value;
  Animate( options );
}

//function(elements)
export function animationValueAndComplete(view, attr, targetValue , complete, duration = 300, ease = "easeInQuad", options = {} ) {
  options.from =  view[ attr ];
  options.to = targetValue;
  options.easing = ease;
  options.duration = duration;
  options.change = value => view[ attr ] = value;
  options.done = complete;
  Animate( options );
}


export function animationValueAndProgress(view, attr, targetValue , progress, duration = 300, ease = "easeInQuad", options = {}) {
  options.from =  view[ attr ];
  options.to = targetValue;
  options.easing = ease;
  options.duration = duration;
  options.change = value => {
    view[ attr ] = value;
    progress(value);
  }
  Animate( options );
}
