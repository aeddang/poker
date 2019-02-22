import getNodeDimensions from 'get-node-dimensions';

export class Rect {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = Number(x);
    this.y = Number(y);
    this.width = Number(width);
    this.height = Number(height);
  }
}

export class Point {
  constructor(x = 0, y = 0) {
    this.x = Number(x);
    this.y = Number(y);
  }
}


export function getStyleUnit(value) {
  return Math.floor(value) + 'px';
}

export function getStyleRatio(value) {
  return Math.floor(value) + '%';
}

export function convertRectFromDimension(view, isRelative = false) {
  let dimension = getNodeDimensions(view);
  if(isRelative && view.parentNode) {
    let parentDimension = getNodeDimensions(view.parentNode);
    return new Rect(dimension.left - parentDimension.left, dimension.top - parentDimension.top, dimension.width, dimension.height);
  } else {
    return new Rect(dimension.left, dimension.top, dimension.width, dimension.height);
  }
}

export function convertPointFromDimension(view, isRelative = false) {
  let dimension = getNodeDimensions(view);
  if(isRelative && view.parentNode) {
    let parentDimension = getNodeDimensions(view.parentNode);
    return new Point(dimension.left - parentDimension.left, dimension.top - parentDimension.top);
  } else {
    return new Point(dimension.left, dimension.top);
  }
}

export function getCertainDigitsString (n, len)
{
	n=Number(n);
	len=Number(len);
  var str = String(n);
  if(str.length >= len) return str;
  var digitsString = "00000000" + str;
	return digitsString.slice(-len);
}

export function getTimeDisplayString (t, div = ":", isFillDigits = false) {
	if( String(t) == "NaN" ) t=0;
	if( t < 0 ) t = 0;
	t = Number(t);
  let h = Math.floor(t/3600);
  let m = Math.floor((t%3600)/60);
  let s = Math.floor(t%60);
  var str = "";
  if (isFillDigits || h>0) str += getCertainDigitsString(h,2) + div;
  str += getCertainDigitsString(m,2) + div;
  str += getCertainDigitsString(s,2);
  return str;
}
