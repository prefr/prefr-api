var ngPullable = angular.module('ngDrawable', [])



ngPullable.directive('ngDrawable',[

	function(){
		return {			
			transclude:		true,

			link: function(scope, element, attrs, controller, transclude){

				var drawable_wrapper 	= element,
					drawable_body 		= angular.element('<div></div>')

				element.append(drawable_body)							

				transclude(function(clone){
					drawable_body.append(clone)
				})

				var	wrapper_tucked	=	{
											'position':			'absolute',
											'display':			'inline-block',
											'width':			'auto',
											'left':				'100%',
											'right':			'auto',											
											'direction':		'ltr',
											'overflow-x':		'visible',													
											'padding-left':		'0px',
										},
					wrapper_drawn 	= 	{
											'display':			'inline-block',											
											'left':				'0px',
											'right':			'0px',
											'overflow-x':		'scroll',
											'padding-left':		'3em'							
										},
					body_tucked		=	{
											'display':			'inline-block',																						
											'padding-left':		'0px',	
											'padding-right':	'0px',
											'margin-left':		'-3em',
											'max-width':		'3em',
											'overflow':			'hidden'
										}	
					body_drawn		=	{
											'display':			'inline-block',											
											'padding-left':		'100%',
											'padding-right':	'100%',
										}

				element.css(wrapper_tucked)
				drawable_body.css(body_tucked)


				function draw(){					
					scope.drawn 	= true
					scope.tucked 	= false

					drawable_wrapper
					.css(wrapper_drawn)

					drawable_body
					.css(body_drawn)

					element.get(0).scrollLeft = 0
				}

				function tuck(){
					scope.drawn 	= false
					scope.tucked 	= true

					drawable_wrapper
					.css(wrapper_tucked)

					drawable_body
					.css(body_tucked)
				}


				element.on('mousedown', draw)

				angular.element('body').on('mouseup', tuck)


				scope.$on('$destroy', function(){
					angular.element('body').off('mouseup', tuck)
				})
			}

		}
	}
])

