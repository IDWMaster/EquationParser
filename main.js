var ReadLine = require('readline');
var rl = ReadLine.createInterface({input:process.stdin,output:process.stdout});

var StringPointer = function(txt) {
  var position = 0;
    var retval = {
        next:function() {
            position++;
        },
        prev:function(){
            position--;
        },
        get:function() {
            return position == txt.length ? null : txt[position];
        }
    };
  return retval;
};


var isDigit = function(character) {
    return !isNaN(character);
};

var expectNumber = function(txt) {
  var retval = '';
    while(txt.get() != null) {
      if(isDigit(txt.get()) || txt.get() == '.') {
          retval+=txt.get();
          txt.next();
      }else {
          return retval;
      }
  }  
  return retval;
};

//Parses an equation, returning a parse tree
var parse = function(txt,prev) {
    if(txt.get() == null) {
        return;
    }
    if(isDigit(txt.get())) {
        var val = expectNumber(txt)*1;
        //After a number, we can have another token (possibly)
        var next = parse(txt,val);
        return next == undefined ? val : next;
    }
    switch(txt.get()) {
        case '+':
            txt.next();
            return {op:'+',operand0:prev,operand1:parse(txt)};
        break;
    case '-':
        txt.next();
            return {op:'-',operand0:prev,operand1:parse(txt)};
        case '/':
            txt.next();
            return {op:'/',operand0:prev,operand1:parse(txt)};
            break;
    break;
        case '*':
            txt.next();
            var retval = {op:'*',operand0:prev,operand1:parse(txt)};
            //Re-order expression
            if(retval.operand1.op) {
                if(retval.operand1.op == '+') {
                    var mulexp = retval;
                    var addop = retval.operand1;
                    var temp = addop.operand0;
                    addop.operand0 = mulexp;
                    mulexp.operand1 = temp;
                    return addop;
                }
            }
            return retval;
            break;
        case '(':
            txt.next();
            //Subexpression
            var retval = parse(txt);
            if(txt.get() != ')') {
                throw 'Expected )';
            }
            txt.next();
            var next = parse(txt,retval);
            return next == undefined ? retval : next;
            break;
    }
    
    
};

var promptUser = function() {
    rl.question('Enter an equation: ',function(txt){
        var tree = parse(StringPointer(txt));
        console.log(tree);
        var execute = function(node){
            if(node.op) {
                switch(node.op) {
                    case '+':
                        return execute(node.operand0)+execute(node.operand1);
                        break;
                    case '*':
                        return execute(node.operand0)*execute(node.operand1);
                        break;
                        case '/':
                        return execute(node.operand0)/execute(node.operand1);
                        break;
                        case '-':
                        return execute(node.operand0)-execute(node.operand1);
                        break;
                }
            }else {
                return node;
            }
        };
        console.log(execute(tree));
        promptUser();
    });
};
promptUser();