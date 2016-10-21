/*
REMINDER:
-object methods that rely on an objet's local variable should be created inside the object: this.method = function()
	-other wise use prototype outside the object: Object.prototype.method = function()
		-prototype requires less memory usage as it is only created once per instance
		-otherwise method in an object is created with every instance
		
TODOS:	
-better styling/buttons from edit & remove buttons

-edit button clicked twice deletes entry, remove listener?
	-tried but didn't seem to do anything
	
POSSIBLY:
-make a due date option
	-do this by DD-MM-YYYY
	
-day, week, year entries?
*/

/* for strike-through
	var listText = this.li.children[0];
	listText.style.textDecoration = 'line-through';
	
	this.editBtn.removeEventListener('click', this.edit_entry, false);
	this.editBtn.addEventListener('click', toggle, false);
	
	function toggle(){
		if(listText.style.textDecoration === 'line-through'){
			listText.style.textDecoration = '';
		} else if(listText.style.textDecoration === ''){
			listText.style.textDecoration = 'line-through';
		}
	}
	 */

window.onload = init;

function init(){
	var oL = new List(document.getElementsByTagName('div')[0], 
					JSON.parse(localStorage.getItem('todolist')) || null);
					
	if(oL.savedList !== null){
		oL.add_saved_li();
	}			

	var addBtn = document.getElementById('add');
	var urgentBtn = document.getElementById('urgent');
	var eraseBtn = document.getElementById('clear');
	
	addBtn.addEventListener('click', function(){
		var entry = document.getElementById('textBox').value;
		var newItem = new List_Item(entry);
		oL.add_li(newItem.create_li());
	}, false);
	
	urgentBtn.addEventListener('click', function(){
		var entry = document.getElementById('textBox').value;
		var newItem = new List_Item(entry);
		oL.urgent_li(newItem.create_li());
	}, false);
	
	eraseBtn.addEventListener('click', function(){
		oL.erase_li();
	}, false);
	
	var oL_save = oL.save_list;
	var save = oL_save.bind(oL);
	window.onunload = save;
}

// -----
function List_Item(txt){
	// ol -> li was too annoying, switched to divs
	// List_Item is <div id="list"> <p class="divText">string</p> <div class="btnDiv"> <button class='done'>-</button> <button class="remove">X</button> </div> </div>
    this.li = document.createElement('div');
	
	this.txt = txt;
	this.taskText = document.createTextNode(this.txt);
	this.textDiv = document.createElement('p');
	
	this.btnDiv = document.createElement('div');
	this.editBtn = document.createElement('button');
	this.removeBtn = document.createElement('button');
	
	this.editImg = document.createElement('img');
	this.editImg.setAttribute('src', '../icons/pencil.png');
	this.editImg.setAttribute('width', '20px');
	this.editImg.className = 'entryImg';
	
	this.remImg = document.createElement('img');
	this.remImg.setAttribute('src', '../icons/recycle-bin.png');
	this.remImg.setAttribute('width', '20px');
	this.remImg.className = 'entryImg';
}

List_Item.prototype.create_btn = function(type, btn){ // call with 'done'/'remove' & done/removeBtn
	btn.className = type;
	if(type === 'remove'){
		btn.appendChild(this.remImg);
		// create a reference to the List_Item's method
		var this_remove = this.remove_entry;
		// bind the List_Item to the reference
		var rem = this_remove.bind(this);
		// use the reference as the listener
		btn.addEventListener('click', rem, false);

		return btn;
	} else {
		btn.appendChild(this.editImg);

		var this_edit = this.edit_entry;
		var edit = this_edit.bind(this);
		btn.addEventListener('click', edit, false);
		
		return btn;
	}
};

List_Item.prototype.create_li = function(){
	// creates the list item
	this.li.className = 'listItem';
	this.btnDiv.className = 'btnDiv';
	this.textDiv.className = 'textDiv';
	this.textDiv.style.textDeocration = this.doneStyle;
	
	this.textDiv.append(this.taskText);
	this.li.appendChild(this.textDiv);
	this.btnDiv.appendChild(this.create_btn('-', this.editBtn));
	this.btnDiv.appendChild(this.create_btn('remove', this.removeBtn));
	this.li.appendChild(this.btnDiv);
	
	return this.li;
};

List_Item.prototype.remove_entry = function(){
	this.li.parentNode.removeChild(this.li);
};

List_Item.prototype.edit_entry = function(){
	// edit an entry
	var liChild = this.li.children;
	var listText = liChild[0].textContent;
	var textBox = document.createElement('input');
	
	textBox.setAttribute('type', 'text');
	textBox.setAttribute('maxLength', '60');
	textBox.setAttribute('value', listText);
	textBox.className = 'edited';
	// remove p element and replace with text box
	this.li.removeChild(liChild[0]);
	this.li.insertBefore(textBox, liChild[0]);
	
	var _blur_ = blur_entry.bind(this);
	textBox.addEventListener('blur', _blur_, true);
	
	function blur_entry(){
		var entry = document.getElementsByClassName('edited');
		var txt = entry[0].value;
		
		var p = document.createElement('p');
		var newText = document.createTextNode(txt);

		p.className = 'textDiv';
		p.appendChild(newText);

		this.li.removeChild(liChild[0]);
		this.li.insertBefore(p, liChild[0]);
	}
};
// end List_Item


// -----
function List(list, savedList){
	// List is document.getElementsByTagName('div')[0] and JSON.parse(localStorage.getItem('todolist') || null
	// created when page loaded
	this.list = list;
	this.savedList = savedList;
};

List.prototype.length = function(){
	return this.list.childElementCount;
};

List.prototype.add_li = function(li){
	// called with append_li(new List_Item(entry))
	this.list.appendChild(li);
	
	document.getElementById('textBox').value = '';
	document.getElementById('textBox').setAttribute('placeholder', 'Add a new task...');
};

List.prototype.urgent_li = function(li){
	// called with urgent_li(new List_Item(entry))
	this.list.firstChild.before(li); // maybe this.list.insertBefore(li, this.list.firstChild)?
	
	document.getElementById('textBox').value = '';
	document.getElementById('textBox').setAttribute('placeholder', 'Add a new task...');
};

List.prototype.erase_li = function(){
	// this.length() returns new number with every loop
	while(this.length() > 0){
		this.list.removeChild(this.list.children[0]);
	}
};

List.prototype.save_list = function(){
	var savedData = [];

	if(this.list.children[0] !== undefined){
		for(var x = 0; x < this.length(); x++){
			var listItem = {};
			var savedText = this.list.children[x].textContent;
			if(savedText.length > 0){
				listItem['text'] = savedText;
				savedData.push(listItem);
			}	
		}
		localStorage.setItem('todolist', JSON.stringify(savedData));
	}
	localStorage.setItem('todolist', JSON.stringify(savedData));
};

List.prototype.add_saved_li = function(){
	for(var x = 0; x < this.savedList.length; x++){
		this.add_li(new List_Item(this.savedList[x]['text']).create_li());
	}
};// end List
