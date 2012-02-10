const St = imports.gi.St;
const Shell = imports.gi.Shell;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const Main = imports.ui.main;
const Signals = imports.signals;

const Lang = imports.lang;

function kimPropertyButton() {
    this._init.apply(this, arguments);
}

kimPropertyButton.prototype = {
    __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(iconName,tooltipText,key,kimpanel) {
        PanelMenu.ButtonBox.prototype._init.call(this, { reactive: true,
                                               can_focus: true,
                                               track_hover: true,
                                               style_class: 'panel-status-button'});
        this.actor.connect('button-press-event', Lang.bind(this, this._onButtonPress));
        
        this._iconActor = new St.Icon({ icon_name: iconName,
                                        icon_type: St.IconType.FULLCOLOR,
                                        style_class: 'system-status-icon' });
        
        this.actor.add_actor(this._iconActor);
        this.setTooltip(tooltipText);
        
        this.key = key;
        this.kimpanel = kimpanel;
    },

    setIcon: function(iconName,type) {
        //global.log("set icon: " + iconName);
        if (type == undefined) {
            this._iconActor.icon_type = St.IconType.FULLCOLOR; 
        }else{
            this._iconActor.icon_type = type; 
        }
        this._iconActor.icon_name = iconName;
    },
    
    setTooltip: function(text) {
        if (text != null) {
            this.tooltip = text;
            this.actor.has_tooltip = true;
            this.actor.tooltip_text = text;
        } else {
            this.actor.has_tooltip = false;
            this.tooltip = null;
        }
    },
   
    _onButtonPress: function(actor, event){
        button = event.get_button();
        if(button==3){
            //right click
            if (this.menu == undefined )
                this.emit('menu',event);
                return;
        }else{
            //left click
            this.kimpanel.triggerProperty(this.key);
            return; 
        }
    }
}

Signals.addSignalMethods(kimPropertyButton.prototype);

kimIndicator.prototype = {
    __proto__: PanelMenu.Button.prototype,
    _init: function(kimpanel){
        PanelMenu.Button.prototype._init.call(this,0.0);
        
        this._properties = {};
        this._propertySwitch = {};

        this.kimpanel = kimpanel;
        
        this._iconActor = new St.Icon({ icon_name: 'input-keyboard',
                                        icon_type: St.IconType.SYMBOLIC,
                                        style_class: 'system-status-icon' });
        
        this.actor.add_actor(this._iconActor);
        this.actor.add_style_class_name('panel-status-button');
        this.actor.has_tooltip = true;
        this.actor.tooltip_text = 'kimpanel';

        this._setting = new PopupMenu.PopupMenuItem("Settings");
        this._setting.connect('activate', Lang.bind(this, function(){
            this.kimpanel.emit('Configure');
        }));
        this._reload = new PopupMenu.PopupMenuItem("Reload Configuration");
        this._reload.connect('activate', Lang.bind(this, function(){
            this.kimpanel.emit('ReloadConfig');
        }));

        Main.panel.addToStatusArea('kimpanel', this);
        this.menu.addMenuItem(this._reload);
        this.menu.addMenuItem(this._setting);
        
        this.nButtons = 0; 
    },
    
    _parseProperty: function(property) {
        //global.log("parse properties");
        let p = property.split(":");
        key = p[0];
        this._properties[key] = {
            label: p[1],
            icon: p[2],
            text: p[3]
        }
        return key;
    },
    
    _addPropertyItem: function(key) {
        if ( key in this._properties )
        {   
            let property = this._properties[key];

            item = new kimPropertyButton(property.icon, null, key, this.kimpanel); 

            //item.connect('menu', Lang.bind(this, this._onButtonPress));
            
            this._propertySwitch[key] = item;
            Main.panel._rightBox.insert_actor(item.actor, this.nButtons);
            this.nButtons++;
        }
    },
    
    _updatePropertyItem: function(key) {
        let property = this._properties[key];
        let item = this._propertySwitch[key]; 
        item.setIcon(property.icon);
        //item.setTooltip(property.label);
        return;
    },

    _updateProperties: function( properties ) {
        if( properties == undefined )
        {
            //global.log(key); 
            for ( key in this._propertySwitch )
            {
                let property = this._properties[key];
                let item = this._propertySwitch[key]; 
                item.setIcon(property.icon);
                //item.setTooltip(property.label);
            }
            return;
        }else{
            for( p in properties){
                let key = this._parseProperty( properties[p] );
                if( key in this._propertySwitch )
                    this._updatePropertyItem(key);
                else
                this._addPropertyItem(key);
            } 
        }
    },

}

function kimIndicator(kimpanel) {
    this._init.apply(this, arguments);
}

