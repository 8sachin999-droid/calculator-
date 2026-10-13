var exprEl=document.getElementById('expr'),resEl=document.getElementById('res'),modeEl=document.getElementById('mode'),
histEl=document.getElementById('hist'),memEl=document.getElementById('mem');
var expr='',ans=0,deg=true,history=[],justEvaluated=false;

var layout=[
['sin(','sin','fn'],['cos(','cos','fn'],['tan(','tan','fn'],['(','(','fn'],[')',')','fn'],
['asin(','sin⁻¹','fn'],['acos(','cos⁻¹','fn'],['atan(','tan⁻¹','fn'],['ln(','ln','fn'],['log(','log','fn'],
['√(','√','fn'],['^','xʸ','fn'],['!','x!','fn'],['π','π','fn'],['e','e','fn'],
['%','%','fn'],['Ans','Ans','fn'],['1/(','1/x','fn'],['DEG','DEG/RAD','fn'],['DEL','⌫','fn'],
['7','7'],['8','8'],['9','9'],['÷','÷','op'],['AC','AC','op'],
['4','4'],['5','5'],['6','6'],['×','×','op'],['−','−','op'],
['1','1'],['2','2'],['3','3'],['+','+','op'],['=','=','eq'],
['0','0','z'],['.','.'],['EXP','×10ˣ','fn']
];
var keysEl=document.getElementById('keys');
layout.forEach(function(k){
  var b=document.createElement('button');
  b.textContent=k[1];b.className=k[2]||'';b.setAttribute('data-k',k[0]);
  b.setAttribute('aria-label',k[1]);
  keysEl.appendChild(b);
});
/* rows of 5: fix the layout by CSS order — equals spans two rows */
(function(){
  var kk=keysEl.children, n=kk.length;
  /* last row: 0 (span2), ., EXP , = already placed earlier */
})();

function parse(src){
  var s=src.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi').replace(/√/g,'sqrt').toLowerCase();
  var open=(s.match(/\(/g)||[]).length-(s.match(/\)/g)||[]).length;
  while(open-->0)s+=')';
  var t=s.match(/\d*\.?\d+|[a-z]+|[-+*\/^%!()]|\S/g)||[],p=0;
  function peek(){return t[p]}
  function isStart(x){return x!==undefined&&(/^[\d.]/.test(x)||/^[a-z]/.test(x)||x==='(')}
  function toRad(x){return deg?x*Math.PI/180:x}
  function fromRad(x){return deg?x*180/Math.PI:x}
  function expr(){var v=term();while(peek()==='+'||peek()==='-'){var o=t[p++],r=term();v=o==='+'?v+r:v-r}return v}
  function term(){var v=unary();for(;;){var x=peek();
    if(x==='*'||x==='/'){p++;var r=unary();v=x==='*'?v*r:v/r}
    else if(isStart(x)){v=v*unary()}
    else break}return v}
  function unary(){if(peek()==='-'){p++;return -unary()}if(peek()==='+'){p++;return unary()}return pow()}
  function pow(){var b=post();if(peek()==='^'){p++;return Math.pow(b,unary())}return b}
  function post(){var v=prim();for(;;){var x=peek();
    if(x==='!'){p++;v=fact(v)}else if(x==='%'){p++;v=v/100}else break}return v}
  function fact(n){if(n<0||Math.floor(n)!==n||n>170)throw 0;var r=1;for(var i=2;i<=n;i++)r*=i;return r}
  function prim(){
    var x=t[p++];
    if(x===undefined)throw 0;
    if(/^[\d.]/.test(x)){var n=parseFloat(x);if(isNaN(n))throw 0;return n}
    if(x==='('){var v=expr();if(t[p++]!==')')throw 0;return v}
    if(x==='pi')return Math.PI;
    if(x==='e')return Math.E;
    if(x==='ans')return ans;
    var f={sin:function(a){return Math.sin(toRad(a))},cos:function(a){return Math.cos(toRad(a))},tan:function(a){return Math.tan(toRad(a))},
      asin:function(a){return fromRad(Math.asin(a))},acos:function(a){return fromRad(Math.acos(a))},atan:function(a){return fromRad(Math.atan(a))},
      ln:Math.log,log:Math.log10,sqrt:Math.sqrt}[x];
    if(!f)throw 0;
    if(t[p++]!=='(')throw 0;
    var a=expr();if(t[p++]!==')')throw 0;
    return f(a);
  }
  var out=expr();
  if(p<t.length)throw 0;
  if(!isFinite(out))throw 0;
  /* clean trig noise like sin(180) = 1.2e-16 */
  if(Math.abs(out)<1e-14)out=0;
  return out;
}
function fmt(v){
  var r=Number(v.toPrecision(12));
  if(r!==0&&(Math.abs(r)>=1e12||Math.abs(r)<1e-9))return r.toExponential(6).replace(/\.?0+e/,'e').replace('e+','e');
  return String(r);
}
function show(final){
  exprEl.textContent=expr;
  resEl.classList.remove('err');
  if(final)return;
  if(!expr){resEl.textContent='0';return}
  try{resEl.textContent=fmt(parse(expr))}catch(e){/* keep previous preview while typing */}
}
function evaluate(){
  if(!expr)return;
  try{
    var v=parse(expr);
    history.unshift({e:expr,r:fmt(v)});if(history.length>30)history.pop();
    ans=v;memEl.textContent='Ans = '+fmt(v);
    exprEl.textContent=expr+' =';
    resEl.textContent=fmt(v);resEl.classList.remove('err');
    expr=fmt(v);justEvaluated=true;
    renderHist();
  }catch(e){
    resEl.textContent='Check your expression';resEl.classList.add('err');
  }
}
function renderHist(){
  histEl.innerHTML='';
  if(!history.length){histEl.innerHTML='<li class="empty">Your calculations will appear here.</li>';return}
  history.forEach(function(h){
    var li=document.createElement('li');
    li.innerHTML='<span></span><span></span>';
    li.children[0].textContent=h.e+' =';li.children[1].textContent=h.r;
    li.onclick=function(){expr=h.r;justEvaluated=false;show()};
    histEl.appendChild(li);
  });
}
function press(k){
  if(k==='='){evaluate();return}
  if(k==='AC'){expr='';justEvaluated=false;show();return}
  if(k==='DEL'){expr=expr.replace(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|ln\(|√\(|1\/\(|Ans|.)$/,'');show();return}
  if(k==='DEG'){deg=!deg;modeEl.textContent=deg?'DEG':'RAD';show();return}
  if(k==='EXP')k='×10^';
  var isOp=/^[+−×÷^!%]$/.test(k)||k==='×10^';
  if(justEvaluated&&!isOp)expr='';
  justEvaluated=false;
  expr+=k;show();
}
keysEl.addEventListener('click',function(e){var b=e.target.closest('button');if(b)press(b.getAttribute('data-k'))});
document.getElementById('clr').onclick=function(){history=[];renderHist()};
document.addEventListener('keydown',function(e){
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  var k=e.key;
  if(k==='Enter'||k==='='){e.preventDefault();press('=');return}
  if(k==='Backspace'){press('DEL');return}
  if(k==='Escape'){press('AC');return}
  var map={'*':'×','/':'÷','-':'−'};
  if(/^[0-9.+()^!%]$/.test(k)||map[k]){e.preventDefault();press(map[k]||k)}
});