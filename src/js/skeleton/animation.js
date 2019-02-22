import Velocity from 'velocity-animate';

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
