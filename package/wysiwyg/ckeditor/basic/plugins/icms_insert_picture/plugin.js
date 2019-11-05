CKEDITOR.plugins.add( 'icms_insert_picture', {
    icons: 'icms_insert_picture',
    init: function( editor ) {
		// При инициализации редактора изменить настройки диалога
		CKEDITOR.on( 'dialogDefinition', function( ev ) {
			var dialogName = ev.data.name;
			var dialogDefinition = ev.data.definition;
			console.log(dialogName);
			//Если функция вызвана для нужного диалога - поменять его
			if ( dialogName == 'image') {
				// Удалить вкладку
				dialogDefinition.removeContents( 'advanced' );
				// Добавить новую
				dialogDefinition.addContents( {
				id: 'tSelectFromAlbum',
				label: 'Выбрать',
				accessKey: 'M',
				elements: [
				{
					type: 'select',
					id: 't_album',
					label: 'Выберите альбом:',
					items: [],
					onLoad: getAlbums,
					onChange: function( api ) {
							if (this.getValue() !=="") setPhotos(this.getValue());
						}	
				},
				{
					type: 'select',
					id: 't_photos',
					className : 't_photoSelector',
					items:[],
					label: 'Выберите изображение:',
					onChange: setURL
				}
				]
				});
			 
			}
			});
    }
});

/* Забрать список альбомов с сервера и отобразить в диалоге*/
function getAlbums(element) 
{
	var control = this;
	$.ajax({url: "/albums"}).done(function (msg){
		control.clear();
		names = [];
		msg.match(/<div class="photos_album_title">[^<]*/gi)
			.forEach(function(elem){names.push(elem.substr(32).trim());});
		urls = msg.match(/\/albums\/[a-z0-9A-Z-]*/gi);
		control.add("Не выбран","");
		for (var i in urls)
			control.add(names[i],urls[i]);
		});
}

/* Забрать список изображений с сервера и отобразить в диалоге */
function setPhotos(source)
{
		var photos = [];
		
		console.log("setPhotos: " + source + ".html");
		options = [];
		$.ajax({url: source+".html"}).done(function (msg){
			res =  msg.match(/<img.*>/g);
			if (res===null) {console.log('setPhotos: некорректный ответ'); return;}
			if (res.length>0)
			{
					for (var i=1; i<res.length;i++)
					{
						elem = res[i];
						
						var b = elem.substring(elem.indexOf('<img')+10);
						var c = b.substring(0,b.indexOf('"'));
						var d = elem.substring(elem.indexOf("title")+7);
						var e = d.substring(0,d.indexOf('"'));
						
						options.push([c,e]);
					}

				photos = options;

				console.log("setOptions: " + photos);
				$("select.t_photoSelector").empty();
				$("select.t_photoSelector").append($("<option value=''>Не выбрано</option>"));
				for (i in photos)
				{
					photo = photos[i];
					$("select.t_photoSelector").append($("<option value='" + photo[0] + "'>" + photo[1] + "</option>"));
				}
			}
			else console.log("Альбом '" + source + "' пуст")
		}
		
		);
}

/* Установить URL выбранного изображения в диалоге */
function setURL(element)
{
	console.log(element);
	if (element.data.value!=="")
	{
		dialog = CKEDITOR.dialog.getCurrent();
		dialog.setValueOf('info', 'txtUrl', element.data.value);
	}
}