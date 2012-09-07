/**
 * @fileOverview Сценарий объединяет несколько функций, обрабатывающих 
 * представление документов сайта <a href="http://elkonina.ru">elkonina.ru</a>:
 * Утилитарные:
 * getElByCls - для отбора элементов по классу в IE7;
 * loadingScriptOut - загрузка последней версии jQuery с googleapis.com;
 * evt - установка и удаления обработки событий;
 * 
 * Основные функции объединены в пространстве имен ELK и представляют 
 * собой методы этого объекта:
 * ELK.doTextShadows -  для создания теней для текста в браузерах, не 
 * 						поддерживающих css-правило 'text-shadow';
 * ELK.doSections -  делит текст на секции для удобности восприятия;
 * ELK.doColumns -  для создания колонок для текста в браузерах, не 
 * 						поддерживающих css-правило 'columns';
 * ELK.doGallery -  модуль представляет галерею работ в минималистичном 
 * 						и развернутом видах;
 * ELK.decorPageHistory -  декорирует разделы текста страницы "Моя история" 
 * 						"фирменным" рисунком сайта;
 * ELK.decorPageFavorite -  декорирование шапки страницы "Я читаю" на холсте;
 * ELK.adjustPageContacts -  корректирует представление страницы "Мои контакты";
 * ELK.init -  в зависимости от загружаемого документа вызывает вышеназванные методы;
 * @author <a href="http://elkonina.ru">Конина Елена</a>
 */
(function(){
	/**
	 * Утилитарная функция для отбора элементов по классу в IE7
	 * @type {Function}
	 * @param {String} cls - класс искомого элемента
	 * @return {Element[]} result - массив элементов с указанным классом
	 */
	var getElByCls = function(cls){
		if(document.querySelectorAll) {
			return document.querySelectorAll("." + cls);
		}
		else if(document.getElementsByClassName) {
			return document.getElementsByClassName(cls);
		}
		else {
			var list = document.getElementsByTagName('*'), 
				i = list.length,
				clsAr = cls.split(/\s+/), 
				result = [];
			while(i--) {
				if(list[i].className.search('\\b' + clsAr + '\\b') !== -1) {
					result.push(list[i]);
				}
			}
			return result;
		}
	};
	/**
	 * Объект имеет метод загрузки сценария из внешнего источника и свойство,
	 * где сохранен адрес библиотеки jQuery последней версии на хосте
	 * googleapis.com
	 * 
	 * @type {!Object}
	 */
	var	loadingScriptOut = {
		/**
		 * @author <a href="*
		 *         http://stevesouders.com/efws/script-onload.php">Стив Соудерс</a>
		 * @param {String}
		 *            src - адрес скрипта, который должен быть загружен
		 * @param {function}
		 *            callback - функция будет вызвана после успешной загрузки
		 *            внешнего скрипта
		 * @param {Element}
		 *            appendTo - html-элемент, куда будет загружен внешний
		 *            скрипт, default: head.
		 */
		init : function(src, callback, appendTo) {
			/**
			 * сценарий, загружаемый на страницу из внешнего источника
			 * 
			 * @type {Element}
			 */
			var script = document.createElement('script');
			// all modern browser
			if (script.readyState && !script.onload) {
				script.onreadystatechange = function() {
					if ((script.readyState === "loaded" || script.readyState === "complete")
						&& !script.onloadDone) {
						script.onloadDone = true;
						callback();
					}
				};
			} 
			// IE
			else {
				script.onload = function() {
					if (!script.onloadDone) {
						script.onloadDone = true;
						callback();
					}
				};
			}
			script.type = 'text/javascript';
			script.src = src;
			if (!appendTo) {
				appendTo = document.documentElement.children[0];
			}
			appendTo.appendChild(script);
		},
		jQ : "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
	},
	/**
	 * Объект имеет методы - функции-обертки для многократной установки
	 * обработчиков событий
	 * 
	 * @type evt
	 * @type { {add: Function, remove: Function} }
	 */
	evt = (function() {
		if (document.addEventListener) {
			return {
				/**
				 * Установка события
				 * 
				 * @memberOf evt
				 * @type {function}
				 * @param {Element} el - элемент, на котором запускается событие
				 * @param {String} type - тип события
				 * @param {function} fn - функция - обработчик события
				 */
				add : function(el, type, fn) {
					el.addEventListener(type, fn, false);
				},
				/**
				 * Удаление события
				 * 
				 * @memberOf evt
				 * @type {function}
				 * @param {Element} el - элемент, на котором запускается событие
				 * @param {String} type - тип события
				 * @param {function} fn - функция - обработчик события
				 */
				remove : function(el, type, fn) {
					el.removeEventListener(type, fn, false);
				}
			};
		} else if (document.attachEvent) { // IE
			return {
				/**
				 * Установка события
				 * 
				 * @memberOf evt
				 * @type {function}
				 * @param {Element} el - элемент, на котором запускается событие
				 * @param {String} type - тип события
				 * @param {function} fn - функция - обработчик события
				 */
				add : function(el, type, fn) {
					el.attachEvent('on' + type, fn);
				},
				/**
				 * Удаление события
				 * 
				 * @memberOf evt
				 * @type {function}
				 * @param {Element} el - элемент, на котором запускается событие
				 * @param {String} type - тип события
				 * @param {function} fn - функция - обработчик события
				 */
				remove : function(el, type, fn) {
					el.detachEvent('on' + type, fn);
				}
			};
		}
	}()),

	/**
	 * Пространство имен для сайта http://elkonina.ru/
	 * 
	 * @author <a href="http://elkonina.ru">Konina Yelena</a>
	 * @namespace
	 * @type {Object}
	 * 
	 * @description В одном пространстве собрано по модулю для нескольких
	 *              страниц сайта: columns для 'моя история', gallery для 'мои
	 *              работы', resizePage для 'мои контакты'.
	 */	
	ELK = {
	
	/**
	 * Функция для создания теней для текста в браузерах, не поддерживающих
	 * css-правило 'text-shadow'.
	 * 
	 * @function
	 * @type {function}
	 * @return {function} возвращаемая функция запускает в работу частные
	 *         функции и переменные, определенные в замыкании
	 * @description Наличие браузерами поддержки css-правила 'text-shadow'
	 * 				определяется с помощью пользовательского сценария <a
	 *              href="http://modernizr.com/">modernizer</a>.
	 *              Непосредственно тени формируются с помощью сценария <a
	 *              href="http://www.hintzmann.dk/testcenter/js/jquery/textshadow/">jquery.textshadow.js</a>
	 *              Created by Martin Hintzmann 2008 martin [a] hintzmann.dk MIT
	 *              (http://www.opensource.org/licenses/mit-license.php)
	 *              licensed.
	 */
	
	doTextShadows : function (){
			/**
			 * Адрес сценария
			 * 
			 * @type {String}
			 */
		var textShadowSrc = 'js/jquery.textshadow.min.js',
			/**
			 * Функция создает обернутый набор из предварительно отобранных
			 * элементов, для которых задано css-правило 'text-shadow'. Затем
			 * каждый элемент набора обрабатывается ф-й textShadow() плагина
			 * jquery.textshadow.js.
			 * 
			 * @type {function}
			 * @param {Array.
			 *            <Element>} nodes - массив html-элементов, для которых
			 *            задано css-правило 'text-shadow'.
			 */
			makeShadow = function(nodes) {
				// если библиотека jQuery и плагин jquery.textshadow.js к этому
				// моменту уже загружены
				if (typeof $ === 'function' && typeof $.fn.textShadow === 'function') {
					/**
					 * jQuery- объект, в который будут добавляться все
					 * отобранные элементы для последующей обработки плагином.
					 * 
					 * @type {jQuery} обернутый набор
					 */
					var jQset;
					for (var i = 0; i <nodes.length; i+=1){
						jQset = $(jQset).add(nodes[i]);
					}
					$(jQset).each(function() {
						$(this).textShadow();
					});
				}
			},
			/**
			 * Функция загружает внешние скрипты библиотеки jQuery и плагина
			 * jquery.textshadow.js, после этого callback выполняется функция
			 * make() создания из переданного параметром массива элементов
			 * набора для обработки функцией textShadow().
			 * 
			 * @type {function}
			 * @param {Array.
			 *            <Element>} nodes - массив html-элементов, для которых
			 *            задано css-правило 'text-shadow'.
			 */
			init = function(nodes) {		
					/**
					 * Разрешение глобального объекта в локальной переменной
					 * 
					 * @type { {init: function, jQ: String} }
					 */
				var loadjs = loadingScriptOut,
					appendTo = document.body;
		
				if (typeof $ === 'undefined') {
					// сначала загружается библиотека jQuery
					loadjs.init(loadjs.jQ, function() {
					// потом загружается плагин jquery.textshadow.js
												loadjs.init(textShadowSrc, function() {
					// потом обрабатывается массив
																			makeShadow(nodes);
																		}, appendTo);
							}, appendTo);
				} else if (typeof $ === 'function') {
					loadjs.init(textShadowSrc, function() {
												makeShadow(nodes);
											}, appendTo);
				};
			};
	
		/**
		 * Возвращаемая функция обходит все дерево DOM и собирает все узлы, для
		 * которых задано css-правило 'text-shadow', после этого запускает в
		 * работу функции обработки узлов, определенных в замыкании.
		 * 
		 * @type {function}
		 */
		return function () {
				/**
				 * В массив будут отбираться все узлы с 'text-shadow' при обходе
				 * DOM.
				 * 
				 * @type {Array.<Element>}
				 */
			var els = [],
				/**
				 * Функция обхода дерева DOM
				 * 
				 * @type {function}
				 * @param {Element}
				 *            n - узел DOM
				 */
				getEls = function (n) {
					if (n.nodeType == 1 && n.currentStyle['text-shadow']) {
						if (n.nodeName.toLowerCase() === 'a' && n.className.indexOf('works__head') !== -1 ) return;
						els.push(n);
					}
					/**
					 * Массив дочерних элементов текущего узла n
					 * 
					 * @type {object HTMLCollection}
					 */
					var chdn = n.children,
						i = 0,
						last = chdn.length;
					for (; i < last; i++) {
						getEls(chdn[i]);
					}
					return els;
				},	
				/**
				 * Массив узлов с 'text-shadow'
				 * 
				 * @type {Array.<Element>}
				 */
				elsWthSdw = getEls(document.body);
			init(elsWthSdw);
		};
	},
	/**
	 * Разделяет текст на секции для удобности восприятия
	 * @type {Function}
	 * @param {String} el - элемент, разделяемый на части
	 * @param {Number} num - число секций на странице
	 * @return {Array} Массив узлов секций для последующего 
	 * 				распределения их содержимого по колонкам
	 */
	doSections : function(el, num){
		/**
		 * Элемент, разделяемый на части
		 * @type {HTMLElement()}
		 */
	var main = document.querySelector ? document.querySelectorAll('.' + el)[0] : getElByCls(el)[0],
		/**
		 * Вложенные параграфы, которые и будут распределяться по секциям
		 * @type {HTMLElement()}
		 */
		all = document.querySelector ? main.querySelectorAll('p') : main.getElementsByTagName('p'),
		/**
		 * Массив объектов со свойствами: link - ссылка на параграф, 
		 * number - количество слов в предлоежении
		 * @type { {link: HTMLParagraphElement, number: Number} }
		 */
		paras = [],
		/**
		 * Счетчик количества слов в предложении, определяется в замыкании
		 * @type {Number}
		 */
		counter = 0,
		/**
		 * Функция обхода DOM-дерева, выбора текстовых узлов и подсчета количества слов в них.
		 * @type {Function}
		 * @param {Node()} - узел DOM-дерева.
		 * @return {Number} counter - количество слов для данного параграфа.
		 */
		round = function (node) {
			if (node.nodeType === 3 && /[^\S+]/.test(node.nodeValue)){
					/**
					 * Массив слов в параграфе
					 * @type {Array}
					 */
				var ar = node.nodeValue.split(' ');
				counter = counter + ar.length;
				
			} else if (node.nodeType === 1) {
				var children = node.childNodes;
				for (var i = 0; i < children.length; i++) {
					round(children[i]);
				}
			}		
			return counter;
		},
		/**
		 * Общее количество слов во всех параграфах
		 * @type {Number}
		 * @field 
		 * @description Немедленно вызываемая функция инициирует массив paras объектами со свойствами: 
		 * link - ссылка на параграф, number - количество слов в предложении. Затем 
		 * вычисляется общее количество слов во всех параграфах и возвращается это значение.
		 */
		getAmount = (function () {
			for (var i = 0; i < all.length; i++) {
				paras[paras.length] = {
					number : (function () {
						counter = 0;
						return round(all[i]);
					}()),
					link : all[i].cloneNode(true)
				};
			}
			var amount = 0;
			for (var i = 0; i < paras.length; i++) {
				for (var k in paras[i]) {
					if (k === 'number')
						amount = amount + paras[i].number;
				}
			}
			return amount;
		}()),
		/**
		 * Объем одной секции (количество слов с учетом числа секций)
		 * @type {Number}
		 * @field
		 */
		part = (function () {
			return Math.floor(getAmount/num);
		}()),
		/**
		 * Массив чисел (меток) - количества параграфов, после которых 
		 * должна начаться новая секция.
		 * @type {Array}
		 * @description Немедленно вызываемая функция проводит сравнение:
		 * объем секции должен быть больше суммы слов предыдущих параграфов 
		 * и меньше суммы слов предыдущих и следующего параграфа, если сравнение 
		 * успешно, значит разделение на секции будет таким, что предыдущие параграфы
		 * будут в одной секции, а остальные, начиная со следующего в другой.
		 * @return {Array} mark - массив меток
		 */
		compare = (function () {
				/**
				 * Минимальное количество слов
				 * @type {Number}
				 */
			var min = 0, 				
				/**
				 * Максимальное количество слов, изначально инициируется числом,
				 * определяющим количество слов в первом параграфе, тогда всегда 
				 * будет разница между min и max на один параграф (Чтобы не пилить параграф).
				 * @type {Number}
				 */
				max = paras[0].number,
				/**
				 * Массив меток - количества параграфов, после которых  должна начаться новая секция.
				 * @type {Array}
				 */				
				mark = [],
				/**
				 * Мера объема секции
				 * @type {Number}
				 */
				dim = part;
			for (var i = 0; i < paras.length - 1; i++) {
				for (var k in paras[i]) {
					if (k === 'number'){
						min = min + paras[i].number;
						max = max + paras[i+1].number;
						if(dim >= min && dim <= max){
							mark.push(i);
							dim = dim + part;
						}								
					}
				}
			}
			// чтобы остаток парагрфов, не вошедших в полноразмерную секцию, не болтался в хвосте 
			//последняя метка замещается числом всего количества параграфов.
			mark.splice(-1,1,paras.length);
			return mark;
		}()),
		/**
		 * Массив узлов секций для последующего распределения их содержимого по колонкам
		 * @type {Array}
		 * @description Немедленно вызываемая функция распределяет параграфы по сециям 
		 * и перестраивает DOM  с учетом нового содержимого. Возвращает массив узлов 
		 * секций для последующего распределения их содержимого по колонкам.
		 */
		rebuildDOM = (function () {
			var frag = document.createDocumentFragment(),
				j = 0,
				/**
				 * Массив, хранящий объект для дальнейшей обработки для построения колонок,
				 * если агент не поддерживает css-columns
				 * @type {Array}
				 */
				sectiones = [];
			for (var i = 0; i < compare.length; i++) {
				/**
				 * Секция, содержащая параграфы в рассчитанном объеме
				 * @type {HTMLElement()}
				 */
				var div = document.createElement('div');			
				cycle: for (; j < paras.length; j++) {
							//пока число параграфов меньше метки, они наполняют этот div
							if (typeof compare[i] !== 'undefined' && j <= compare[i]) {
								div.appendChild(paras[j].link);
							} else break cycle;
						}
				div.className = main.className;
				sectiones.push(div);
				frag.appendChild(div);
			}
			main.parentNode.replaceChild(frag, main);
			return sectiones;
		}());
		return rebuildDOM;
	},
	/**
	 * Функция для создания колонок для текста в браузерах, не поддерживающих
	 * css-правило 'columns'.
	 * 
	 * @type {function}
	 * @return {function} возвращаемая функция запускает в работу частные
	 *         функции и переменные, определенные в замыкании
	 * @description Функция здесь немедленно вызываемая, т.к. используется на
	 *              каждой странице сайта. Наличие браузерами поддержки
	 *              css-правила 'text-shadow'определяется с помощью
	 *              пользовательского сценария <a
	 *              href="http://modernizr.com/">modernizer</a>.
	 *              Непосредственно тени формируются с помощью сценария <a
	 *              href="http://www.hintzmann.dk/testcenter/js/jquery/textshadow/">jquery.textshadow.js</a>
	 *              Created by Martin Hintzmann 2008 martin [a] hintzmann.dk MIT
	 *              (http://www.opensource.org/licenses/mit-license.php)
	 *              licensed.
	 */
	doColumns : function(){	
			/**
			 * Адрес сценария
			 * 
			 * @type {String}
			 */
		var columnizeSrc = 'js/jquery.columnizer.min.js',
			/**
			 * Корректирует визуальное представление колонок на странице,
			 * переписывая значение ширины колонок.
			 * 
			 * @type {function}
			 */			
			fixForIE7 = function(){
				if ( /(^|\s)ie7(\s|$)/.test(document.documentElement.className) ){
					$('.column').css('width',"31%");
				}
			},
			/**
			 * Непосредственно обрабатывает элементы, передаваемые ей
			 * параметром, создавая в них колонки.
			 * 
			 * @param {Number}
			 *            объект Arguments содержит первым параметром число,
			 *            определяющее сколько колонок будет создано.
			 * @param {String | Object}
			 *            объект Arguments содержит строку или узел или их массив,
			 *            каждая из которых идентифицирует объект, в котором
			 *            будут созданы колонки.
			 * @type {function}
			 */
			init = function() {
					/**
					 * Массив параметров, переданных функции при вызове.
					 * 
					 * @type {Array}
					 */
				var args = arguments[0],
					/**
					 * Число, определяющее сколько колонок будет создано.
					 * 
					 * @type {Number}
					 */
					num,
					/**
					 * jQuery- объект, в который будут добавляться все
					 * отобранные элементы для последующей обработки плагином.
					 * 
					 * @type {jQuery} обернутый набор
					 */
					jQset;
				if (args.length !== 0) {
					for (var i = 0; i < args.length; i++) {
						if (typeof args[i] == 'number'){
							num = args[i];
						} else {
							jQset = $(jQset).add( $(args[i]) );
						}
					}
					
					if (typeof jQuery === 'function' && typeof $.fn.columnize === 'function') {
						$(jQset).each(function() {
									$(this).columnize({
												columns : num
											});
								});
					}
					fixForIE7();
				}	
			};
			/**
			 * Возвращаемая функция загружает внешние скрипты библиотеки jQuery
			 * и плагина jquery.columnizer.min.js, после этого callback
			 * выполняется функция init() создания из переданного параметром
			 * массива элементов набора для обработки функцией columnize().
			 * 
			 * @type {function}
			 * @param {String}
			 *            объект Arguments содержит строку или массив строк,
			 *            каждая из которых идентифицирует объект, в котором
			 *            будут созданы колонки.
			 * @param {Number}
			 *            объект Arguments содержит последним параметром число,
			 *            определяющее сколько колонок будет создано.
			 */
		return function() {		
				/**
				 * Разрешение глобального объекта в локальной переменной
				 * 
				 * @type { {init: function, jQ: String} }
				 */
			var loadjs = loadingScriptOut,
				appendTo = document.body,
				/**
				 * Массив параметров, переданных функции при вызове.
				 * 
				 * @type {Array}
				 */
				params = arguments;
			
			if (typeof jQuery === 'undefined') {
				loadjs.init(loadjs.jQ, function() {
											loadjs.init(columnizeSrc, function() {
														init(params);
									}, appendTo);
						}, appendTo);
			} else if (typeof jQuery === 'function') {
				loadjs.init(columnizeSrc, function() {
							init(params);
						}, appendTo);
			};
		};
	},	
	/**
	 * Модуль представляет галерею работ.  
	 * @type gallery
	 * @return 
	 * @description при загрузке работы отображаются в виде 
	 * небольших изображений, расположенных одно за другим с переходом на новою строку.
	 * При нажатии специальных кнопок, определяющих представление галереи, галерея 
	 * может разворачиваться в представление работ по вертикальному списку с отображением 
	 * крупных изображений, при нажатии на которые открывается новое окно с искомой работой.
	 */
	doGallery : function () {
		/**
		 * Изображения работ, загружаемые в html-коде.
		 * @type {HTMLCollection()}
		 */
	var images = document.images,
		/**
		 * Список работ. Xранилище оригинальной копии(полученной при загрузке страницы).
		 * @name gallery~list
		 * @type {HTMLUListElement()}
		 */
		list,
		/**
		 * Список работ. Xранилище измененной копии с расширенным представлением.
		 * @name gallery~clone
		 * @type {HTMLUListElement()}
		 */
		clone,
		/**
		 * Меняет класс дочерних узлов элемента списка для изменения отображения 
		 * на странице согласно соответствующим css-правилам. Используется для 
		 * расширенного представления работ.
		 * 
		 * @type {function}
		 * @param {Element} node - узел элемента списка
		 */
		changeClass = function (node) {
			if (node.nodeType == 1 && /_view_small(\s|$)/.test(node.className)) {
				node.className = node.className.replace(/(.+)(_view_small)/, '$1');
			}
			var children = node.children,
				i = 0,
				last = children.length;
			for (; i < last; i++) {
				changeClass(children[i]);
			}
		},
		/**
		 * Регулирует загрузку изображений как изначальную при загрузке страницы, 
		 * так и последующие при смене представления галереи.
		 * Функция в своем теле определяет исходные данные для представления галереи 
		 * (объекты - элементы и функции обработки). Вызов функции возвращает методы,
		 * используемые в дальнейшем другими функциями для обработки представления галереи.
		 * @type {Function}
		 * @return {{displayLink: function, setClick: function, resetClick: function, openInNewWindow: function, toggle: function}} 
		 */
		loadingImg = function () {
				/**
				 * Объект содержит методы, обрабатывающие событие наведения мыши 
				 * на изображение работы и клика по ней с открытием этой работы в новом окне.
				 * @type { {setHandleOfClick: function, resetHandleOfClick: function, displayLink: function, openInNewWindow: function} }
				 * @type setLink
				 */
			var setLink = (function () {
						/**
						 * Локальная ссылка на document.images
						 * @type {HTMLCollection}
						 */
					var imgs = images,
						/**
						 * Значение ссылки, соотносимой с изображением, на которое наведена мышь.
						 * @private
						 * @field
						 * @type {HTMLAnchorElement()}
						 */
						link,
						/** 
						 * Установка обрабатывания собятия нажатия на изображение.
						 * @public
						 * @type {function}
						 * @param {HTMLCollection} o - document.images
						 * @param {function} fn - обработчик нажатия - открытие новой страницы с искомой работой.
						 */
						setHandle = function (o, fn) {
							if((Object.prototype.toString.call(o) === "[object Object]" || Object.prototype.toString.call(o) === "[object HTMLCollection]") && o.length){
								$(o).each(function () {
									$(this).bind('click', fn);
								});
							}
						},
						/** 
						 * Снятие обрабатывания собятия нажатия на изображение.
						 * @public
						 * @type {function}
						 * @param {HTMLCollection} o - document.images
						 * @param {function} fn - обработчик нажатия - открытие новой страницы с искомой работой.
						 */
						resetHandle = function (o, fn) {
							if((Object.prototype.toString.call(o) === "[object Object]" || Object.prototype.toString.call(o) === "[object HTMLCollection]") && o.length){
								$(o).each(function () {
									$(this).unbind('click', fn);
								});
							}
						},
						/**
						 * Отображает, что изображение "вложено" в ссылку: при наведении на изображение
						 * всплывает подчеркивание у соответствующей ссылки.
						 * @public
						 * @type {function}
						 * @return {function} новая функция устанавливает обработку наведения мыши на изображение
						 * @description На самом деле структура кода такова: 
						 * 				figure > div>img + figcaption> h2>a + p + h3 + ul>li 
						 */
						show = (function () {
								/**
								 * Отображает подчеркивание сслылки при наведении мыши на соответствующее изображение
								 * @public
								 * @type {function(Event)}
								 * @param {Event} e - здесь объект Event библиотеки jQuery
								 */
							var toggleLink = function(e) {
									/**
									 * Изображение, на которое наведена мышь.
									 * @type {Object}
									 */
								var cnt = e.target,
									/**
									 * Ссылка, чей предок - figure - общий с изображением, на котором мышь.
									 * @type {jQuery.<HTMLAnchorElement>}
									 */
									cntLink = $("a:first", $(cnt).parents("figure"));
								/**
								 * Определение глобальной переменной, которая используется потом при 
								 * нажатии на изображение для перехода на новую страницу с работой, 
								 * которую это изображение представляет.
								 * @type {HTMLAnchorElement()}
								 */
								link = cntLink[0];
									
								if (cntLink.css('textDecoration') == 'underline') {
									cntLink.css({'textDecoration':'', 'color':'', 'textShadow':''});
									link = '';
								} else {
									cntLink.css({'textDecoration':'underline', 'color':'#7c4b7f', 'textShadow':'1px 1px 5px #fff'});
								};
							};
								/**
								 * Новая возвращаемая функция непосредственно устанавливает обработку 
								 * наведения мыши на изображение.
								 * @type {function} 
								 */
							return 	function() {
									/**
									 * Локальная ссылка на document.images
									 * @type {HTMLCollection}
									 */
								var imgs = images;
								$(imgs).each(function () {
									$(this).bind('mouseover', function(e){toggleLink(e);}).bind('mouseout', function(e){toggleLink(e);});
								});
							};
						}()),
						/**
						 * Открывает новое окно с работой. Адрес окна формируется из ссылки, 
						 * чей предок - figure - общий с изображением, по которому кликнули.
						 * @type {function}
						 * @param {jQuery.<Event>} e - объект события по версии библиотеки jQuery.
						 */
						openW = function (e) {
								/**
								 * Изображение, по которому кликнули.
								 * @type {jQuery.<HTMLImageElement()>}
								 */
							var cnt = e.target,
								/**
								 * Локальная ссылка на значение глобально определенной переменной 
								 * при наведении мыши на изображение в represent~toggleLink
								 * @type {HTMLAnchorElement()}
								 */
								defaultLink = link,
								/**
								 * Ссылка, по адресу которой откроется новое окно с работой.
								 * @type {HTMLAnchorElement()}
								 */
								cntLink = '';
							
							if (defaultLink) {
									cntLink = defaultLink;
								} else {
									cntLink = $("a:first", $(cnt).parents("figure"))[0];
								}
								if (cntLink.target){
									window.open(cntLink.href, cntLink.target);
								} else {
									window.open(cntLink.href, '_blank');
								}
								
						};
						
					return {
						/**						
						 * Установка обрабатывания собятия нажатия на изображение.
						 * @memberOf setLink
						 * @function
						 * @type {function}
						 * @param {HTMLCollection} o - document.images
						 * @param {function} fn - обработчик нажатия - открытие новой страницы с искомой работой.
						 */
						setHandleOfClick : setHandle,								
						/**						
						 * Снятие обрабатывания собятия нажатия на изображение.
						 * @memberOf setLink
						 * @function
						 * @type {function}
						 * @param {HTMLCollection} o - document.images
						 * @param {function} fn - обработчик нажатия - открытие новой страницы с искомой работой.
						 */
						resetHandleOfClick : resetHandle,					
						/**					
						 * Отображает ссылку: при наведении на изображение
						 * всплывает подчеркивание у соответствующей ссылки.
						 * @memberOf setLink
						 * @function
						 * @type {function}
						 */
						displayLink : show,
						/**
						 * Открывает новое окно с искомой работой. 
						 * @memberOf setLink
						 * @function
						 * @type {function}
						 * @param {jQuery.<Event>} e - объект события по версии библиотеки jQuery.
						 */
						openInNewWindow : openW
					};	
				}()),
				/**
				 * Загружает представление галереи работ:
				 * если вызывается с параметром, то изображения работ 
				 * перегружаются новые в большом формате, если без параметра - 
				 * то изображения перегружаются согласно изначальным атрибутам, 
				 * определенным в html-коде. 
				 * 
				 * @type {function}
				 * @param {String} order - 'no_small', здесь как метка, что адрес изображения 
				 * 					должен измениться, чтобы загрузилось большое изображение. 
				 */
				loadView = function(order) { 
						/**
						 * Локальная ссылка на images(document.images), определенную глобально
						 * @type {HTMLCollection}
						 */
					var imgs = images;
					for (var i = 0, last = images.length; i < last; i++) {
						if(order){
							imgs[i].src = imgs[i].src.replace(/(.*)(_small)/, '$1');
							imgs[i].width = 448;
							imgs[i].height = 232;
							$(imgs[i].parentNode).css("backgroundImage",'url('+ imgs[i].src.replace(/(.*)(_small)/, '$1') + ')');					
						} else {
							$(imgs[i].parentNode).css("backgroundImage",'url(' + imgs[i].src + ')');
						}
					}
				};
			loadView();	
			return {
				/**					
				 * Отображает ссылку: при наведении на изображение
				 * всплывает подчеркивание у соответствующей ссылки.
				 * @borrows setLink#displayLink as loadingImg.displayLink
				 * @function
				 * @type {function}
				 */
				displayLink : setLink.displayLink,
				/**						
				 * Установка обрабатывания собятия нажатия на изображение.
				 * @borrows setLink#setHandleOfClick as loadingImg.setClick
				 * @function
				 * @type {function}
				 * @param {HTMLCollection} o - document.images
				 * @param {function} fn - обработчик нажатия - открытие новой страницы с искомой работой.
				 */
				setClick : setLink.setHandleOfClick,			
				/**						
				 * Снятие обрабатывания собятия нажатия на изображение.
				 * @borrows setLink#resetHandleOfClick as loadingImg.resetClick
				 * @function
				 * @type {function}
				 * @param {HTMLCollection} o - document.images
				 * @param {function} fn - обработчик нажатия - открытие новой страницы с искомой работой.
				 */
				resetClick : setLink.resetHandleOfClick,		
				/**
				 * При клике на изображение открывается новое окно с искомой работой. 
				 * @borrows setLink#openInNewWindow as loadingImg.openInNewWindow
				 * @function
				 * @type {function}
				 * @param {jQuery.<Event>} e - объект события по версии библиотеки jQuery.
				 */
				openInNewWindow : setLink.openInNewWindow,
				/**
				 * Меняет представление галереи работ:
				 * при вызове с парметром - изображения работ в большом формате,
				 * без параметра - изображения работ маленькие.
				 * @borrows setLink#loadView as loadingImg.toggle
				 * @function
				 * @type {function}
				 * @param {String} order - 'no_small', здесь как метка, что адрес изображения 
				 * 					должен измениться, чтобы загрузилось большое изображение. 
				 */
				toggle : loadView
			};
		},
		/**
		 * Объект хранит результат вызова функции loadingImg,
		 * для дальнейшей работы вложенных функций (чтобы не вызывать loadingImg еще раз)
		 * @type {loadingImg()}
		 */
		obj = {},
		/**
		 * Отображает расширенное представление галереи работ:
		 * работы выстроены вертикально по списку, добавлено описание к
		 * каждой работе, изображения перезагружаются в большом формате,
		 * для каждого изображения делается обработка наведения мыши и клика.
		 * @type {function}
		 */
		makeLargePresent = function() {	
				/**
				 * Список работ - узел DOM
				 * @type {jQuery.<HTMLUListElement>}
				 */
			var worksList =  $('.works__list'),
				/**
				 * Точная копия уза списка работ с дочерними элементами.
				 * @type {jQuery.<HTMLUListElement>}
				 */
				listClone = worksList.clone(), 				 
				/**
				 * Локальная ссылка на images(document.images), определенную глобально
				 * @type {HTMLCollection}
				 */
				imgs = images;				
			/**		 
			 * Инициализация переменной, определенной глобально.
			 * Будет храниться оригинальная копия списка работ 
			 * (полученная при загрузке страницы).
			 * @type {HTMLUListElement()}
			 */
			list = worksList[0];
			// меняем класс элементов для отображения расширенного представления
			changeClass(listClone[0]);
	
			/**		 
			 * Инициализация переменной, определенной глобально.
			 * Будет храниться измененная копия с расширенным представлением
			 * @type {HTMLUListElement()}
			 */
			clone = listClone[0];
			
			worksList.replaceWith(listClone);
			if (obj.lenght !== 0) {
				obj.toggle('no_small');
				obj.displayLink();
				obj.setClick(imgs, obj.openInNewWindow);
			}
		},
		/**
		 * Отображает краткое представление работ: работы отображаются в виде 
		 * небольших изображений, расположенных одно за другим с переходом на
		 * новою строку. Описание работ скрыто, видны только изображения.
		 * @type {function}
		 */
		makeShortPresent = function() {
				/**
				 * Локальная копия глобальной переменной, содержащей ссылку на 
				 * список работ в оригинальном отображении (как при загрузке).
				 * @type {HTMLUListElement()}
				 */
			var original = list, 
				/**
				 * Текущее представление списка работ - расширенное.
				 *  @type {HTMLUListElement()}
				 */
				cntList = clone, 
				 
				/**
				 * Локальная ссылка на images(document.images), определенную глобально
				 * @type {HTMLCollection}
				 */
				imgs = images;
			
			if (original && original.nodeName && cntList.parentNode) {				
				cntList.parentNode.replaceChild(original, cntList);
			} else {
				return;	
			}	
			
			if (obj.lenght !== 0) {
				obj.setClick(imgs, obj.openInNewWindow);
			}
		},
		/**
		 * Построение кнопок, регулирующих представление галереи.
		 * @type creatingButtons
		 * @param {loadingImg()} p - результат вызова ф-и loadingImg
		 */
		creatingButtons = function(p){
			/**
			 * Инициализируем переменную, определенную глобально.
			 * Она хранит результат вызова ф-и loadingImg.
			 * @type {loadingImg()} 
			 */
			obj = p;
			
			var wrapper = $('.wrapper'),
				head = $('.head'),
				/**
				 * Корректирует общий вид страницы: при разных представлениях галереи
				 * страница выглядит по-разному.
				 * @type {function}
				 */
				correctTotalView = function () {
					wrapper.toggleClass('wrapper_has_bg');
					head.toggleClass('head_has_bg');
				},
				/**
				 * Загружает изображение кнопок вместо отрисовки их на холсте,
				 * если браузер не поддерживает API Canvas.
				 * @type {function}
				 * @param {String} src - адрес изображения на сервере
				 * @param {String} posX - позиционирование изображения по горизонтале
				 * @param {String} posY - позиционирование изображения по вертикале
				 * @param {HTMLCanvasElement()} instead - canvas вместо которого загружается изображение. 
				 */
				loadImgInstead = function(src, posX, posY, instead) {
						/**
						 * Представление кнопки - div, у которого фоном отображается требуемая кнопка.
						 * @type {Element} 
						 */
					var button = document.createElement('div');
					
					button.id = instead.id;
					button.className = instead.className;
					button.style.width = instead.width;
					button.style.height = instead.height;
					button.style.backgroundImage = 'url(' + src + ')';
					button.style.backgroundPositionX = posX;
					button.style.backgroundPositionY = posY;
					button.style.backgroundRepeat = 'no-repeat';
					instead.parentNode.replaceChild(button, instead);
				},				
				/**
				 * Отрисовывает на холсте кнопку, символизирующую представление галереи в расширенном виде
				 * @memberOf creatingButtons
				 * @type {function}
				 */
				paintButtonLarge = (function() {
						/**
						 * Элемент-canvas, определенный в DOM.
						 * @type {jQuery.<HTMLCanvasElement>}
						 */
					var canvas = $("#btn_lrg"),
						/**
						 * Определяем перменную для дальнейших операций методами javascript.
						 * @type {HTMLCanvasElement()}
						 */
						cvs = canvas[0];
					
					canvas.bind('click', function(){
						if (!wrapper.hasClass('wrapper_has_bg')) {
							correctTotalView();
						}
						var imgs = images;
					
						obj.resetClick(imgs, obj.openInNewWindow);
						makeLargePresent();
					}); 					
					//  если браузер не поддерживает API Canvas
					if (!cvs.getContext) {
						loadImgInstead("i/works/works__buttons.png", '0','0', cvs);
						// обработка события устанавливается на заменяющий div 
						$("#btn_lrg").bind('click', function(){
							if (!wrapper.hasClass('wrapper_has_bg')) {
								correctTotalView();
							}
							var imgs = images;
							obj.resetClick(imgs, obj.openInNewWindow);
							makeLargePresent();
						}); 
						return;
					}
					var ctx = cvs.getContext("2d");
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(44.4, 30.0);
					ctx.bezierCurveTo(44.4, 37.2, 38.6, 43.1, 31.4, 43.1);
					ctx.lineTo(13.5, 43.1);
					ctx.bezierCurveTo(6.3, 43.1, 0.5, 37.2, 0.5, 30.0);
					ctx.lineTo(0.5, 13.6);
					ctx.bezierCurveTo(0.5, 6.3, 6.3, 0.5, 13.5, 0.5);
					ctx.lineTo(31.4, 0.5);
					ctx.bezierCurveTo(38.6, 0.5, 44.4, 6.3, 44.4, 13.6);
					ctx.lineTo(44.4, 30.0);
					ctx.closePath();
					ctx.fillStyle = "rgb(203, 201, 232)";
					ctx.fill();
					ctx.strokeStyle = "rgb(123, 74, 126)";
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(38.7, 21.7);
					ctx.bezierCurveTo(38.7, 23.6, 37.1, 25.2, 35.1, 25.2);
					ctx.lineTo(9.6, 25.2);
					ctx.bezierCurveTo(7.6, 25.2, 6.0, 23.6, 6.0, 21.7);
					ctx.lineTo(6.0, 21.7);
					ctx.bezierCurveTo(6.0, 19.7, 7.6, 18.1, 9.6, 18.1);
					ctx.lineTo(35.1, 18.1);
					ctx.bezierCurveTo(37.1, 18.1, 38.7, 19.7, 38.7, 21.7);
					ctx.lineTo(38.7, 21.7);
					ctx.closePath();
					ctx.fillStyle = "rgb(248, 216, 210)";
					ctx.fill();
					ctx.strokeStyle = "rgb(194, 126, 114)";
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(38.9, 10.8);
					ctx.bezierCurveTo(38.9, 12.7, 37.3, 14.3, 35.3, 14.3);
					ctx.lineTo(9.8, 14.3);
					ctx.bezierCurveTo(7.9, 14.3, 6.3, 12.7, 6.3, 10.8);
					ctx.lineTo(6.3, 10.8);
					ctx.bezierCurveTo(6.3, 8.8, 7.9, 7.2, 9.8, 7.2);
					ctx.lineTo(35.3, 7.2);
					ctx.bezierCurveTo(37.3, 7.2, 38.9, 8.8, 38.9, 10.8);
					ctx.lineTo(38.9, 10.8);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(38.7, 32.7);
					ctx.bezierCurveTo(38.7, 34.6, 37.1, 36.2, 35.1, 36.2);
					ctx.lineTo(9.6, 36.2);
					ctx.bezierCurveTo(7.6, 36.2, 6.0, 34.6, 6.0, 32.7);
					ctx.lineTo(6.0, 32.7);
					ctx.bezierCurveTo(6.0, 30.7, 7.6, 29.1, 9.6, 29.1);
					ctx.lineTo(35.1, 29.1);
					ctx.bezierCurveTo(37.1, 29.1, 38.7, 30.7, 38.7, 32.7);
					ctx.lineTo(38.7, 32.7);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}()),
				/**
				 * Отрисовывает на холсте кнопку, символизирующую простое 
				 * представление галереи из маленьких изображений.
				 * @memberOf creatingButtons
				 * @type {function}
				 */
				paintButtonSmall = (function() {
						/**
						 * Элемент-canvas, определенный в DOM.
						 * @type {jQuery.<HTMLCanvasElement>}
						 */
					var canvas = $("#btn_sml"),
						/**
						 * Определяем перменную для дальнейших операций методами javascript.
						 * @type {HTMLCanvasElement()}
						 */
						cvs = canvas[0];
					
					canvas.bind('click', function(){						
						var imgs = images;
						obj.resetClick(imgs, obj.openInNewWindow);
						if (wrapper.hasClass('wrapper_has_bg')) {
							correctTotalView();
						}
						makeShortPresent();
					}); 					
					//  если браузер не поддерживает API Canvas
					if (!cvs.getContext) {
						loadImgInstead("i/works/works__buttons.png", '100%','0', cvs);
						// обработка события устанавливается на заменяющий div 
						$("#btn_sml").bind('click', function(){
							var imgs = images;
							obj.resetClick(imgs, obj.openInNewWindow);
							if (wrapper.hasClass('wrapper_has_bg')) {
								correctTotalView();
							}
							makeShortPresent();
						}); 
						return;
					} 
					var ctx = cvs.getContext("2d");
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(44.4, 30.0);
					ctx.bezierCurveTo(44.4, 37.2, 38.6, 43.1, 31.4, 43.1);
					ctx.lineTo(13.5, 43.1);
					ctx.bezierCurveTo(6.3, 43.1, 0.5, 37.2, 0.5, 30.0);
					ctx.lineTo(0.5, 13.6);
					ctx.bezierCurveTo(0.5, 6.3, 6.3, 0.5, 13.5, 0.5);
					ctx.lineTo(31.4, 0.5);
					ctx.bezierCurveTo(38.6, 0.5, 44.4, 6.3, 44.4, 13.6);
					ctx.lineTo(44.4, 30.0);
					ctx.closePath();
					ctx.fillStyle = "rgb(203, 201, 232)";
					ctx.fill();
					ctx.strokeStyle = "rgb(123, 74, 126)";
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(19.3, 15.7);
					ctx.bezierCurveTo(19.3, 17.5, 17.9, 18.9, 16.1, 18.9);
					ctx.lineTo(11.2, 18.9);
					ctx.bezierCurveTo(9.4, 18.9, 8.0, 17.5, 8.0, 15.7);
					ctx.lineTo(8.0, 10.8);
					ctx.bezierCurveTo(8.0, 9.0, 9.4, 7.6, 11.2, 7.6);
					ctx.lineTo(16.1, 7.6);
					ctx.bezierCurveTo(17.9, 7.6, 19.3, 9.0, 19.3, 10.8);
					ctx.lineTo(19.3, 15.7);
					ctx.closePath();
					ctx.fillStyle = "rgb(248, 216, 210)";
					ctx.fill();
					ctx.strokeStyle = "rgb(194, 126, 114)";
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(37.3, 15.7);
					ctx.bezierCurveTo(37.3, 17.5, 35.9, 18.9, 34.1, 18.9);
					ctx.lineTo(29.2, 18.9);
					ctx.bezierCurveTo(27.4, 18.9, 26.0, 17.5, 26.0, 15.7);
					ctx.lineTo(26.0, 10.8);
					ctx.bezierCurveTo(26.0, 9.0, 27.4, 7.6, 29.2, 7.6);
					ctx.lineTo(34.1, 7.6);
					ctx.bezierCurveTo(35.9, 7.6, 37.3, 9.0, 37.3, 10.8);
					ctx.lineTo(37.3, 15.7);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(37.5, 33.6);
					ctx.bezierCurveTo(37.5, 35.4, 36.0, 36.9, 34.2, 36.9);
					ctx.lineTo(29.4, 36.9);
					ctx.bezierCurveTo(27.6, 36.9, 26.1, 35.4, 26.1, 33.6);
					ctx.lineTo(26.1, 28.8);
					ctx.bezierCurveTo(26.1, 27.0, 27.6, 25.5, 29.4, 25.5);
					ctx.lineTo(34.2, 25.5);
					ctx.bezierCurveTo(36.0, 25.5, 37.5, 27.0, 37.5, 28.8);
					ctx.lineTo(37.5, 33.6);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(19.3, 33.7);
					ctx.bezierCurveTo(19.3, 35.5, 17.9, 36.9, 16.1, 36.9);
					ctx.lineTo(11.2, 36.9);
					ctx.bezierCurveTo(9.4, 36.9, 8.0, 35.5, 8.0, 33.7);
					ctx.lineTo(8.0, 28.8);
					ctx.bezierCurveTo(8.0, 27.0, 9.4, 25.6, 11.2, 25.6);
					ctx.lineTo(16.1, 25.6);
					ctx.bezierCurveTo(17.9, 25.6, 19.3, 27.0, 19.3, 28.8);
					ctx.lineTo(19.3, 33.7);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}());                
		};
	return function() {
			var loadjs = loadingScriptOut;
			
			if (typeof jQuery === 'undefined') {
			loadjs.init(loadjs.jQ,function(){
										// функция вызывается однажды, потом работают методы, которые она возвращает
										var res = loadingImg();
										res.setClick(images, res.openInNewWindow);
										// вводим результат работы в пользование вложенными функциями
										creatingButtons(res);
									}, document.body);
		} else if (typeof jQuery === 'function') {
			var res = loadingImg();
			res.setClick(images, res.openInNewWindow);
			creatingButtons(res);
		}
	};
},
	/**
	 * Декорирует части текста "фирменным" рисунком сайта.
	 * @type {Function}
	 * 
	 * @param {Object} area - массив элементов (частей) разделение, которых декорируется.
	 * 				Параметром передается результат работы  divideIntoParts() - чтобы 
	 * 				опять не обращаться к DOM.
	 */
	decorPageHistory : function (area) {
			/**
			 * Элемент-canvas, создаваемый в DOM в результате работы сценария,
			 * представляет изображение, декорирующее секции текста на странице.
			 * @type {HTMLCanvasElement()}
			 */
		var cvs,
			/**
			 * @type {CanvasRenderingContext2D()}
			 */
			ctx,			
			/**
			 * Фигура, многократно повторяющаяся на холсте.
			 * @type {HTMLCanvasElement} 
			 * @description не знаю как сделать по-другому, поэтому:
			 * фигура сначала отрисовывается на холсте, затем получается ссылка на нее и
			 * этот "слепок" используется уже как паттерн для отрисовки на холсте этой 
			 * же фигуры несколько раз.
			 */
			shape,
			/**
			 * Паттерн для многократной отрисовки одного изображения на холсте
			 * @type {CanvasPattern()} 
			 */
			ptn,
			/**
			 * Отрисовывает изображение одной фигуры на холсте.
			 * @type {Function}
			 * @param {CanvasRenderingContext2D} contxt - контескт холста
			 */
			draw = function(contxt) {
				/**
				 * Объект, содержащий массивы точек, по которым будет строиться изображение.
				 *  @type {Object}
				 */
				var a = {
					l1 : [2.3, 9.8, 15.3, 11.5, 20.7, 13.9],
					l2 : [22.9, 14.8, 16.6, 8.1, 21.4, 2],
					l3 : [22.5, 0.3, 21.8, 6.5, 25.7, 9.7],
					l4 : [28.3, 6.3, 26, 1.2, 28.1, 0.7],
					l5 : [28.1, 0.7, 28.1, 0.7, 28.1, 0.7],
					l6 : [30.2, 3.2, 32.1, 5.6, 30.5, 9.8],
					l7 : [36, 9.2, 33, 2.8, 41.4, 5.2],
					l8 : [42, 11.2, 34.7, 14, 34.7, 14],
					l9 : [38.1, 16.8, 42.6, 10.1, 48.4, 18.8],
					l10 : [36.3, 24.9, 33.7, 16.8, 31.6, 18.4],
					l11 : [33.8, 19.4, 40.2, 24.5, 37.8, 33.2],
					l12 : [32.5, 30.7, 29.9, 26.4, 28.2, 22.3],
					l13 : [25.6, 25.9, 28.6, 28.5, 23.2, 31],
					l14 : [16.9, 22.2, 23.9, 18.4, 21.7, 16.7],
					l15 : [14.2, 13.8, 8.1, 14.4, 2.9, 15.6],
					l16 : [0.2, 15.7, 0.7, 11.6, 0.8, 11]
				};
				contxt.save();
				contxt.beginPath();
				contxt.moveTo(0.8, 11.0);
				for (var l in a) {
					contxt.bezierCurveTo(a[l][0], a[l][1], a[l][2], a[l][3], a[l][4],a[l][5]);
				}
				contxt.closePath();
				contxt.strokeStyle = "rgb(255, 255, 255)";
				contxt.lineJoin = "miter";
				contxt.miterLimit = 4.0;
				contxt.stroke();
				contxt.restore();
			},
			/**
			 * Перерисовывает изображение на холсте когда изменяется размер окна
			 * @type {Function}
			 */
			redraw = function(){
					/**
					 * В случае деления текста страницы на несколько частей, низ 
					 * каждой из них декорируется изображением, отрисовываемом на холсте.
					 * @type {HTMLCanvasElement()}
					 */				
				var canvases = document.querySelectorAll('.cvs'),
					/**
					 * Ширина холста - декорирование части текста страницы на всю его ширину.
					 * @type {Number}
					 */
					width = canvases[0].parentNode.clientWidth,
					i = 0, 
					/**
					 * @type {CanvasRenderingContext2D()}
					 */
					ctx;
					
				for (; i < canvases.length; i++) {
					ctx = canvases[i].getContext('2d');
					ctx.clearRect(0, 0, cvs.width, cvs.height);	
					ctx.fillStyle = ptn;
					ctx.fillRect(0, 0, width, cvs.height); 
				}
			};
		for (var i = 1; i < area.length; i++) {
			/**
			 * Декорирование каждой секции представляет собой повторяющееся 
			 * изображение фигуры, отрисованное на холсте
			 * @type {HTMLCanvasElement()}
			 */ 
			cvs = document.createElement("canvas");
			if (cvs.getContext){
				ctx = cvs.getContext("2d");
				cvs.height = 40;
				cvs.width = 100;
				// еще будем обращаться к элементу, поэтому отмечаем 
				cvs.className = 'cvs';
				cvs.style.position = 'absolute';
				cvs.style.marginTop = '-50px';
				area[i].parentNode.insertBefore(cvs, area[i]);
				draw(ctx);
				shape = document.querySelectorAll(".cvs")[0];
				ptn = ctx.createPattern(shape, 'repeat-x'); 		
				cvs.width = cvs.parentNode.clientWidth;
				ctx.fillStyle = ptn;
				ctx.fillRect(0, 0, cvs.width, cvs.height);	
				
				evt.add(window, 'resize', redraw);
				
			} 
			// для старых браузеров загружается картинка
			else {
				area[i-1].style.backgroundImage = 'url(i/page_history_divide_section.png)';
				area[i-1].style.backgroundPositionY = '100%';
				area[i-1].style.backgroundRepeat = 'repeat-x';
			}
		}
	},
	/**
	 * Декорирование шапки страницы на холсте
	 * @type {Function}
	 * @param {String} cls - класс элемента-контейнер, 
	 * 				содержащий холст(supported) или 
	 * 				изображение (don't supported)
	 */ 
	decorPageFavorite : function (cls) {
			/**
			 * Элемент - контейнер, содержащий холст(supported) или изображение (don't supported)
			 * @type {HTMLDivElement()}
			 */ 
		var slogan = document.querySelector ? document.querySelector('.' + cls) : getElByCls(cls)[0],
			/**
			 * Загружает изображение, если canvas не поддерживается.
			 * @type {Function} 
			 */ 
			loadImg = function(){
				var img = document.createElement('img');
				img.src= "i/slogan.png";
				img.style.marginTop = '-20px';
				slogan.appendChild(img);
			},
			/**
			 * Холст
			 * @type {HTMLCanvasElement()}
			 */ 
			cvs,
			/**
			 * Контекст холста
			 * @type {CanvasRenderingContext2D()}
			 */ 
			ctx,
			/**
			 * Рисует на холсте
			 * @type {Function}
			 * @param {CanvasRenderingContext2D()} c - контекст холста 
			 */ 
		    draw = function (c) {
		    	//переименование методов для экономии
				if (c.__proto__){
					c.__proto__.b = c.__proto__.bezierCurveTo;
					c.__proto__.f = c.__proto__.fill;
					c.__proto__.ft = c.__proto__.fillText;
					c.__proto__.bp = c.__proto__.beginPath;
					c.__proto__.cp = c.__proto__.closePath;
					c.__proto__.s = c.__proto__.stroke;
					c.__proto__.st = c.__proto__.strokeText;
				} else{
				 	c.b = c.bezierCurveTo;
					c.f = c.fill;
					c.ft = c.fillText;
					c.bp = c.beginPath;
					c.cp = c.closePath;
					c.s = c.stroke;
					c.st = c.strokeText;
				}
				c.save();
				c.font = "20px 'ScrawlRegular'";
				c.fillStyle = "rgb(248, 216, 210)";
				c.ft("ife", 32.9, 117.3);
				c.lineWidth = 2.0;
				c.strokeStyle = "rgb(123, 74, 126)";
				c.lineJoin = "miter";
				c.miterLimit = 0.0;
				c.st("ife", 32.9, 117.3);
				
				c.font = "60px 'ScrawlRegular'";
				c.fillStyle = "rgb(123, 74, 126)";
				c.ft("l", 1.0, 118.6);
				c.strokeStyle = "rgb(248, 216, 210)";
				c.st("l", 1.0, 118.6);
				
				c.ft("d", 224.6, 89.0);
				c.st("d", 224.6, 89.0);
				
				c.ft("R", 372.4, 60.8);
				c.st("R", 372.4, 60.8);
				
				c.font = "20px 'ScrawlRegular'";
				c.fillStyle = "rgb(248, 216, 210)";
				c.ft("is a", 127.6, 99.7);
				c.strokeStyle = "rgb(123, 74, 126)";
				c.st("is a", 127.6, 99.7);
				
				c.fillStyle = "rgb(123, 74, 126)";
				c.ft("ream. ", 264.8, 81.4);
				c.strokeStyle = "rgb(248, 216, 210)";
				c.st("ream. ", 264.8, 81.4);
				
				c.fillStyle = "rgb(248, 216, 210)";
				c.ft("ealize ", 409.9, 53.7);
				c.strokeStyle = "rgb(123, 74, 126)";
				c.st("ealize ", 409.9, 53.7);
				
				c.fillStyle = "rgb(123, 74, 126)";
				c.ft("it!", 507.7, 52.0);
				c.st("it!", 507.7, 52.0);
				
				c.bp();
				
				c.moveTo(99.4, 16.1);
				c.b(97.8, 16.9, 96.2, 15.8, 94.4, 15.6);
				c.b(92.6, 15.4, 74.9, 18.9, 73.7, 19.8);
				c.b(74.0, 20.2, 78.9, 25.6, 72.1, 33.4);
				c.b(64.5, 27.8, 67.8, 24.6, 67.4, 23.0);
				c.b(64.6, 30.0, 59.2, 30.2, 53.8, 32.2);
				c.b(53.7, 20.8, 64.2, 21.2, 62.7, 19.9);
				c.b(57.0, 19.0, 56.5, 22.4, 47.4, 17.0);
				c.b(54.3, 8.5, 61.0, 14.9, 61.7, 13.5);
				c.b(55.5, 8.9, 55.5, 5.5, 54.9, 3.8);
				c.b(61.3, 0.3, 65.9, 7.0, 67.7, 10.6);
				c.b(67.2, 7.3, 67.9, 3.1, 70.3, 1.8);
				c.b(69.7, 6.9, 70.8, 9.5, 72.1, 11.5);
				c.b(75.8, 7.5, 76.2, 7.0, 78.3, 3.4);
				c.b(83.0, 9.2, 77.0, 15.4, 76.9, 15.5);
				c.b(82.5, 17.3, 95.5, 11.9, 99.6, 15.3);
				c.b(99.5, 15.6, 99.5, 15.8, 99.4, 16.1);
				c.cp();
				c.fillStyle = "rgb(248, 216, 210)";
				c.f();
				c.lineJoin = "miter";
				c.miterLimit = 10.0;
				c.s();
				
				c.bp();
				
				c.moveTo(102.7, 18.4);
				c.b(101.8, 20.0, 99.9, 20.1, 98.4, 20.9);
				c.b(96.8, 21.9, 84.8, 35.3, 84.3, 36.8);
				c.b(84.9, 36.9, 92.0, 38.3, 91.2, 48.6);
				c.b(81.8, 48.7, 82.5, 44.2, 81.2, 43.2);
				c.b(83.2, 50.4, 79.0, 53.8, 76.0, 58.7);
				c.b(68.9, 49.6, 77.6, 43.6, 75.6, 43.5);
				c.b(70.6, 46.2, 72.2, 49.2, 61.7, 50.3);
				c.b(62.1, 39.4, 71.3, 40.5, 71.0, 38.9);
				c.b(63.3, 38.9, 61.2, 36.3, 59.7, 35.3);
				c.b(62.8, 28.6, 70.4, 31.2, 74.0, 33.0);
				c.b(71.7, 30.7, 69.7, 26.9, 70.8, 24.4);
				c.b(73.4, 28.8, 75.8, 30.3, 78.1, 31.1);
				c.b(78.6, 25.7, 78.7, 25.0, 78.1, 20.9);
				c.b(85.4, 22.7, 84.3, 31.3, 84.3, 31.4);
				c.b(89.9, 29.5, 97.1, 17.4, 102.3, 17.6);
				c.b(102.5, 17.9, 102.6, 18.1, 102.7, 18.4);
				c.cp();
				c.f();
				c.s();
				
				c.bp();
				
				c.moveTo(446.4, 116.9);
				c.b(447.8, 115.7, 449.6, 116.3, 451.3, 116.0);
				c.b(453.1, 115.7, 469.1, 107.3, 470.0, 106.1);
				c.b(469.6, 105.8, 463.4, 102.0, 467.7, 92.6);
				c.b(476.6, 95.8, 474.4, 99.8, 475.2, 101.2);
				c.b(475.9, 93.8, 481.0, 92.0, 485.6, 88.6);
				c.b(489.0, 99.5, 478.7, 102.1, 480.6, 102.9);
				c.b(486.2, 102.2, 485.7, 98.7, 496.0, 101.4);
				c.b(491.8, 111.5, 483.6, 107.3, 483.3, 108.8);
				c.b(490.5, 111.5, 491.5, 114.7, 492.6, 116.2);
				c.b(487.4, 121.3, 481.1, 116.2, 478.4, 113.3);
				c.b(479.8, 116.3, 480.3, 120.5, 478.3, 122.4);
				c.b(477.5, 117.4, 475.8, 115.2, 473.9, 113.6);
				c.b(471.5, 118.5, 471.2, 119.1, 470.3, 123.2);
				c.b(464.1, 118.9, 468.1, 111.3, 468.1, 111.2);
				c.b(462.3, 111.0, 451.3, 119.8, 446.5, 117.7);
				c.b(446.4, 117.5, 446.4, 117.2, 446.4, 116.9);
				c.cp();
				c.f();
				c.s();
				
				c.bp();
				
				c.moveTo(442.6, 115.6);
				c.b(443.0, 113.9, 444.8, 113.2, 446.0, 112.0);
				c.b(447.3, 110.6, 455.0, 94.3, 455.0, 92.8);
				c.b(454.5, 92.9, 447.3, 93.5, 445.1, 83.4);
				c.b(454.1, 80.7, 454.7, 85.2, 456.2, 85.8);
				c.b(452.3, 79.4, 455.3, 74.9, 456.9, 69.4);
				c.b(466.2, 76.2, 459.6, 84.4, 461.5, 83.9);
				c.b(465.6, 79.9, 463.2, 77.5, 473.0, 73.5);
				c.b(475.7, 84.0, 466.5, 85.6, 467.3, 87.0);
				c.b(474.6, 84.8, 477.3, 86.8, 479.1, 87.3);
				c.b(478.0, 94.5, 469.9, 94.2, 466.0, 93.5);
				c.b(468.9, 95.1, 471.9, 98.1, 471.5, 100.9);
				c.b(467.8, 97.4, 465.0, 96.6, 462.6, 96.5);
				c.b(463.6, 101.8, 463.8, 102.5, 465.5, 106.3);
				c.b(458.0, 106.6, 456.6, 98.1, 456.6, 98.0);
				c.b(451.8, 101.4, 448.3, 115.0, 443.2, 116.3);
				c.b(443.0, 116.1, 442.8, 115.8, 442.6, 115.6);
				c.cp();
				c.f();
				c.s();
				c.restore();
		    };
    	cvs = document.createElement('canvas');
		if(!cvs.getContext) {
			loadImg();
			return;
		}		
    	cvs.width = 540;
    	cvs.height = 161; 
		cvs.style.marginTop = '-20px';
		slogan.appendChild(cvs);
		ctx = cvs.getContext("2d");
		// функция рисования запускается через секунду, чтобы было 
		// гарантировано наличие необходимомго шрифта ScrawlRegular
		setTimeout(function () {
			draw(ctx);			
		}, 1000);
	 },
	/**
	 * Приводит в порядок представление страницы: 
	 * убирает горизонтальный скролл, возникающий 
	 * из-за применения генерируемых элементов, 
	 * представляющих отображение центрального 
	 * изображения страницы в обе стороны.
	 * @type {Function}
	 */ 
	adjustPageContacts : function () {
		var body = document.body;
		body.style.overflow = 'hidden';
	
		var onResize = function(){
			if (window.innerWidth){
				if (window.innerWidth < 1007){
					body.style.overflowX = 'auto';
					body.children[0].style.overflowX = 'hidden';
				} else {
					body.style.overflowX = 'hidden';
					body.children[0].style.overflowX = '';
				}
				if (window.innerHeight < 509){
					body.style.overflowY = 'auto';
				}
			} 
			else if (document.documentElement.clientWidth){
				if (document.documentElement.clientWidth < 1007){
					body.style.overflowX = 'auto';
					body.children[0].style.overflowX = 'hidden';
				} else {
					body.style.overflowX = 'hidden';
					body.children[0].style.overflowX = '';
				}
				if (document.documentElement.clientHeight < 509){
					body.style.overflowY = 'auto';
				}
			}
		
		};
		
		evt.add(window, 'resize', onResize);
	}
	/**
	 * В зависимости от документа в окне инициирует разные функции.
	 * @type {Function}
	 */ 
	,init : function() {
			/**
			 * Локальная ссылка на глобальный объект
			 * @type {Object}
			 */ 
		var that = ELK,
			/**
			 * Массив строк, содержащих название документов сайта
			 * @type {Array}
			 */ 
			pages = ['index', 'works', 'history', 'favorites', 'contacts'],
			/**
			 * Название загрузившегося документа
			 * @type {String}
			 */ 
			page = window.location.href.match(/.+\/((.+).html)*/)[2];

		switch (page) {
			case '': 			//для какого-то из IE
			case undefined : 	//для какого-то из IE
			case pages[0] : 	// index
				break;
			case pages[1] : 	// works
				that.doGallery()();		
				break;
			case pages[2] : 	// history
				var parts = that.doSections('page_history__column', 2);
				if ( /(^|\s)no-csscolumns(\s|$)/.test(document.documentElement.className) ) 
					that.doColumns.call(that)(3, parts);					
				that.decorPageHistory(parts);
				break;
			case pages[3] : 	// favorites
				that.decorPageFavorite('slogan');
				break;
			case pages[4] : 	// contacts
				if (!(/(^|\s)ie7(\s|$)/.test(document.documentElement.className))) 
					that.adjustPageContacts();
				break;

			default :
				break;
		}
		(function () {
			if ( /(^|\s)no-textshadow(\s|$)/.test(document.documentElement.className) )				
				that.doTextShadows()();
		}());
	}
};
	
	ELK.init();
}());

