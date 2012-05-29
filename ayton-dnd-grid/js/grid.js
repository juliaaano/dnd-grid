var _preferences;

$(function() {

	$.ajax({
		type : "GET",
		url : "employee_data.xml",
		dataType : "xml",
		success : parseXml,
		error: function(){alert("ERROR: Failed ajax call to retrieve employee data xml.");}
	});

	$(".draggable").draggable({
		revert : "invalid",
		helper : "clone",
		opacity : 0.7,
		// axis: "y", // problem with helper out of line when dragging vertically.
		create : function (event, ui) {
			$(this).attr("onmouseover", "onMouseOverDraggable(this)");
			$(this).attr("onmouseout", "onMouseOutDraggable(this)");
			$(this).html("<p></p>");
			addShiftLabel($(this).parent()[0].id, $(this));
		}
	});

	for ( var i = 1; i <= 21; i++) {
		var number = i.toString();
		if (i < 10) {
			number = "0" + number;
		}
		$(".droppable-" + number).droppable({
			accept : ".square-" + number,
			hoverClass : "drag-over",
			drop : function(event, ui) {
				onDrop(event, ui, $(this));
			},
			over : function(event, ui) {
				onOver(event, ui, $(this));
			},
			out : function(event, ui) {
				onOut(event, ui, $(this));
			},
			activate : function(event, ui) {
				onActivate(event, ui, $(this));
			},
			deactivate : function(event, ui) {
				onDeactivate(event, ui, $(this));
			}
		});
	}
});

function onDrop(event, ui, droppable) {

	droppable.removeClass("drag-activate-positive");
	droppable.removeClass("drag-activate-negative");
	droppable.removeClass("drag-activate-maybe");

	droppable.addClass("drop");
	
	addShiftLabel(ui.draggable.parent()[0].id, droppable);
	
	ui.draggable.find("p").html("");

	droppable.droppable("disable"); // It's gotta go before ui.draggable("disable");

	ui.draggable.addClass("drag-disabled");
	ui.helper.remove();
	ui.draggable.draggable("disable");
	
	droppable.attr("onclick", "onClickDroppedSquare(this)");
}

function onActivate(event, ui, droppable) {

	var employeeId = droppable.parent()[0].id.substring(9); // Must be format 'employee-00'.
	var employeeIndex = parseInt(employeeId) - 1;

	var weekDayIndex = retrieveWeekDayIndex(ui.draggable[0].title);

	var parentId = ui.draggable.parent()[0].id;

	var preference = "YES";

	if ("morning" == parentId) {
		preference = _preferences[employeeIndex][weekDayIndex].morning;
	} else if ("afternoon" == parentId) {
		preference = _preferences[employeeIndex][weekDayIndex].afternoon;
	} else if ("evening" == parentId) {
		preference = _preferences[employeeIndex][weekDayIndex].evening;
	}

	if ("YES" == preference) {
		droppable.addClass("drag-activate-positive");
	} else if ("NO" == preference) {
		droppable.addClass("drag-activate-negative");
	} else if ("MAYBE" == preference) {
		droppable.addClass("drag-activate-maybe");
	}
}

function onDeactivate(event, ui, droppable) {

	droppable.removeClass("drag-activate-positive");
	droppable.removeClass("drag-activate-negative");
	droppable.removeClass("drag-activate-maybe");
	droppable.removeClass("highlight-droppable");
}

function onOver(event, ui, droppable) {

	// droppable.addClass("drag-over");
}

function onOut(event, ui, droppable) {

	// droppable.removeClass("drag-over");
}

function onMouseOverDraggable(element) {
	
	var squareIndex = element.classList[1].substring(7);
	
	var droppable = $(".droppable-" + squareIndex);
	
	droppable.addClass("highlight-droppable");
}

function onMouseOutDraggable(element) {
	
	var squareIndex = element.classList[1].substring(7);
	
	var droppable = $(".droppable-" + squareIndex);
	
	droppable.removeClass("highlight-droppable");
}

function onClickDroppedSquare(element) {

	var droppable = $(element);

	var shift = droppable.find("p").html();

	var className = element.classList[1];

	var draggable = null;

	if ("MO" == shift) {
		draggable = $('[id="morning"] > [class*=' + className + ']');
	} else if ("AF" == shift) {
		draggable = $('[id="afternoon"] > [class*=' + className + ']');
	} else if ("EV" == shift) {
		draggable = $('[id="evening"] > [class*=' + className + ']');
	}

	draggable.draggable("enable");
	draggable.removeClass("drag-disabled");
	draggable.find("p").html(shift);

	droppable.droppable("enable");
	droppable.removeClass("drop");
	droppable.find("p").html("");
}

function addShiftLabel(shift, element) {
	
	if ("morning" == shift) {
		element.find("p").html("MO");
	} else if ("afternoon" == shift) {
		element.find("p").html("AF");
	} else if ("evening" == shift) {
		element.find("p").html("EV");
	}
}

function retrieveWeekDayIndex(weekDay) {

	var weekDayIndex = 0;

	if ("monday" == weekDay) {
		weekDayIndex = 0;
	} else if ("tuesday" == weekDay) {
		weekDayIndex = 1;
	} else if ("wednesday" == weekDay) {
		weekDayIndex = 2;
	} else if ("thursday" == weekDay) {
		weekDayIndex = 3;
	} else if ("friday" == weekDay) {
		weekDayIndex = 4;
	} else if ("saturday" == weekDay) {
		weekDayIndex = 5;
	} else if ("sunday" == weekDay) {
		weekDayIndex = 6;
	} else {
		alert("WARNING: Unable to determine index for week day: " + weekDay);
	}

	return weekDayIndex;
}

function parseXml(data) {

	var employees = data.getElementsByTagName("employee");

	_preferences = new Array(employees.length); // employees array.

	for ( var i = 0; i < employees.length; i++) {

		_preferences[i] = new Array(7); // days of week.

		var shifts = employees[i].getElementsByTagName("shifts")[0];

		var k = 0;
		for ( var j = 0; j < shifts.childNodes.length; j++) {

			if (shifts.childNodes[j].childNodes.length != 0) {

				_preferences[i][k] = new Object();
				_preferences[i][k].morning = shifts.childNodes[j].getElementsByTagName("morning")[0].firstChild.nodeValue;
				_preferences[i][k].afternoon = shifts.childNodes[j].getElementsByTagName("afternoon")[0].firstChild.nodeValue;
				_preferences[i][k].evening = shifts.childNodes[j].getElementsByTagName("evening")[0].firstChild.nodeValue;

				k++;
			}
		}
	}
}
