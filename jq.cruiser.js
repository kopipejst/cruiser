/**
 * jQuery plugin for selecting range of table cells
 *
 * @version: 1.0 - (2015/01/20)
 * @requires jQuery
 * @author Ivan Lazarevic
 *
 * Licensed under MIT licence:
 *   http://www.opensource.org/licenses/mit-license.php
 */
(function($) {


    $.fn.cruiser = function(options) {

        var counter = 1,
            active = 0,
            O = [],
            defaults = {
                bgColor: 'rgba(160, 195, 255, 0.2)',
                borderColor: '#4285f4',
                handleColor: '#4285f4'
            };

        function init(that) {

            options = $.extend({}, defaults, options);

            var $wrapper = $('<div />').addClass('cruiser-wrapper').css({
                    position: 'relative'
                }),
                $selector = $('<div />').css({
                    position: 'absolute',
                    background: options.bgColor
                }).addClass('cruiser-selector'),
                $border = $('<div />').css({
                    position: 'absolute',
                    zIndex: 2,
                    display: 'none',
                    border: '1px solid ' + options.borderColor
                }).addClass('cruiser-border'),
                $handle = $('<div />').css({
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    height: '6px',
                    width: '6px',
                    cursor: 'crosshair',
                    border: '1px solid #fff',
                    background: options.handleColor
                }).addClass('cruiser-handle');

            $border.append($handle);

            $(that).wrap($wrapper).data('cruiserCounter', counter);

            $(that).parent().prepend($selector).append($border);

            O[counter] = {
                range: {

                },
                dimensions: {
                    col: $(that).find('tr:first-child td').length,
                    row: $(that).find('tr').length
                },
                border: $(that).parent().find('.cruiser-border'),
                selector: $(that).parent().find('.cruiser-selector'),
                elem: that
            };

            counter++;


            /**
             * Mouse down, start selecting
             */
            $(that).find('td').mousedown(function(e) {

                if (e.altKey) {
                    return;
                }

                active = $(that).data('cruiserCounter');

                $(that).parent().find('.cruiser-border').hide();
                var column = this.cellIndex;
                var row = this.parentNode.rowIndex;
                O[active].range.start = {
                    col: column,
                    row: row
                };

                O[active].$start = $(this);

                $(that).parent().find('.cruiser-selector, .cruiser-border').css({
                    top: $(this).position().top - 1,
                    left: $(this).position().left - 1,
                    height: 0,
                    width: 0
                });
                delete O[active].range.end;
                delete O[active].done;
            });


            /**
             * draw selected area when mouse is moving
             * it's a div behind whole table
             */
            $(that).find('td').mousemove(function(e) {

                if (active === 0 || !O[active].range.start) {
                    return;
                }

                if (O[active].done) {
                    return;
                }

                var column = this.cellIndex;
                var row = this.parentNode.rowIndex;

                O[active].range.end = {
                    col: column,
                    row: row
                };

                select($(this));

            });


            /**
             * if we click on handle holder
             * selecting is reset
             */
            $(that).parent().find('.cruiser-border').click(function() {
                $(this).hide();
                $(that).parent().find('.cruiser-selector').css({
                    width: 0,
                    height: 0
                });
                active = $(that).data('cruiserCounter');
                delete O[active].done;
                delete O[active].range.start;
                delete O[active].range.end;
                cruiserEnd(that);
            });


            /**
             * mouse down on handle start resizing
             */
            $(that).parent().find('.cruiser-handle').mousedown(function() {
                $(that).parent().find('.cruiser-border').hide();
                active = $(that).data('cruiserCounter');
                delete O[active].range.end;
                delete O[active].done;

            });


            /**
             * holding alt key and click on cell will select whole row
             */
            $(that).find('td').click(function(e) {

                if (e.altKey) {

                    var $parent = $(this).parent(),
                        $start = $parent.find('td:first-child'),
                        $end = $parent.find('td:last-child');

                    O[active].$start = $start;

                    O[active].range.start = {
                        col: $start[0].cellIndex,
                        row: $start[0].parentNode.rowIndex
                    };
                    O[active].range.end = {
                        col: $end[0].cellIndex,
                        row: $end[0].parentNode.rowIndex
                    };

                    O[active].done = true;

                    select();
                    cruiserEnd(that);

                    $(that).parent().find('.cruiser-border').show();

                }

            });


            /**
             * Clicking on header will select whole column
             */
            $(that).find('th').click(function(e) {

                var $parent = $(this).parent(),
                    $start = $parent.find('td:first-child'),
                    $end = $parent.find('td:last-child'),
                    col = $(this)[0].cellIndex;

                active = $(that).data('cruiserCounter');

                O[active].$start = $start;

                O[active].range.start = {
                    col: col,
                    row: 1
                };
                O[active].range.end = {
                    col: col,
                    row: O[active].dimensions.row - 1
                };

                O[active].done = true;

                O[active].$start = $(that).find("tr:eq(1) td:eq(" + col + ")");

                select();
                cruiserEnd(that);

                $(that).parent().find('.cruiser-border').show();

            });

        }


        /**
         * Trigger selecting end event
         */
        function cruiserEnd(elem) {
            $(elem).trigger('cruiserEnd', O[active].range);
        }


        /**
         * Draw selector div
         */
        function select($end) {

            $end = $end || $(O[active].elem).find("tr:eq(" + O[active].range.end.row + ") td:eq(" + O[active].range.end.col + ")");

            var height = $end.position().top - O[active].$start.position().top + $end.outerHeight(),
                width = $end.position().left - O[active].$start.position().left + $end.outerWidth();

            O[active].selector.css({
                top: O[active].$start.position().top - 1,
                left: O[active].$start.position().left - 1
            });

            O[active].border.css({
                top: O[active].$start.position().top - 1,
                left: O[active].$start.position().left - 1
            });

            if (O[active].range.end.col < O[active].range.start.col) {
                width = O[active].$start.position().left - $end.position().left + O[active].$start.outerWidth();
                O[active].selector.css({
                    left: $end.position().left - 1
                });
                O[active].border.css({
                    left: $end.position().left - 1
                });
            }

            if (O[active].range.end.row < O[active].range.start.row) {
                height = O[active].$start.position().top - $end.position().top + O[active].$start.outerHeight();
                O[active].selector.css({
                    top: $end.position().top - 1
                });
                O[active].border.css({
                    top: $end.position().top - 1
                });
            }

            O[active].selector.css({
                height: height,
                width: width
            });
            O[active].border.css({
                height: height - 1,
                width: width - 1
            });

        }


        /**
         * Mouse up ends selecting
         */
        $(document).mouseup(function(e) {

            if (!O[active] || !O[active].range.start || e.altKey) {
                return;
            } else {
                O[active].done = true;
                if (!O[active].range.end) {
                    // select only one
                    O[active].range.end = {
                        col: O[active].range.start.col,
                        row: O[active].range.start.row
                    };
                    var $elem = $(e.target),
                        height = $elem.outerHeight(),
                        width = $elem.outerWidth();

                    O[active].selector.css({
                        top: $elem.position().top - 1,
                        left: $elem.position().left - 1
                    });
                    O[active].border.css({
                        top: $elem.position().top - 1,
                        left: $elem.position().left - 1
                    });
                    O[active].selector.css({
                        height: height,
                        width: width
                    });
                    O[active].border.css({
                        height: height - 1,
                        width: width - 1
                    });
                    O[active].border.show();

                    cruiserEnd(O[active].elem);

                    return;
                }
            }

            // @TODO check if elem is table element
            O[active].border.show();

            var tmp;

            if (O[active].range.start.col > O[active].range.end.col) {
                tmp = O[active].range.start.col;
                O[active].range.start.col = O[active].range.end.col;
                O[active].range.end.col = tmp;
            }

            if (O[active].range.start.row > O[active].range.end.row) {
                tmp = O[active].range.start.row;
                O[active].range.start.row = O[active].range.end.row;
                O[active].range.end.row = tmp;
            }

            O[active].$start = $(O[active].elem).find("tr:eq(" + O[active].range.start.row + ") td:eq(" + O[active].range.start.col + ")");

            cruiserEnd(O[active].elem);

        });


        /**
         * extend selection with keyboard
         */
        $('body').keydown(function(e) {

            if (e.shiftKey && O[active].range.start && e.keyCode !== 16) {

                switch (e.keyCode) {
                    case 37: // right
                        if (O[active].range.end.col > 0) {
                            O[active].range.end.col--;
                        }
                        break;
                    case 39: // left
                        if (O[active].range.end.col < O[active].dimensions.col - 1) {
                            O[active].range.end.col++;
                        }
                        break;
                    case 38: // up
                        if (O[active].range.end.row > 1) {
                            O[active].range.end.row--;
                        }
                        break;
                    case 40: // down
                        if (O[active].range.end.row < O[active].dimensions.row - 1) {
                            O[active].range.end.row++;
                        }
                        break;
                }

                select();

            }

        });


        /**
         * Trigger cruiserEnd when shift is released
         * in case that user select with keyboard
         */
        $('body').keyup(function(e) {

            if (e.keyCode === 16 && O[active].elem) {

                cruiserEnd(O[active].elem);

                O[active].border.show();

            }

        });


        /**
         * Init cruiser for all elements
         */
        return this.each(function() {
            init(this);
        });

    };


})(jQuery);