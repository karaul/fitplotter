//hacked by Gordon Moore 18 Feb 2021 to allow client side
//in html just <script src=./[your scripts folder]/bf-messages.js></script>

//import { getMessageName, getFieldObject } from './fit';

//export 
function getFitMessage(messageNum) {
  return {
    name: getMessageName(messageNum),
    getAttributes: (fieldNum) => getFieldObject(fieldNum, messageNum),
  };
}

// TODO
//export 
function getFitMessageBaseType(foo) {
  return foo;
}
