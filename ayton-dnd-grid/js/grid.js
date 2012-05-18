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
		stop : function(event, ui) {
			// $(this).remove();
		}
	});

	for ( var i = 1; i <= 14; i++) {
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
	// droppable.find("p").html("Dropped!");

	droppable.droppable("disable"); // It's gotta go before ui.draggable("disable");

	ui.draggable.addClass("drag-disabled");
	ui.helper.remove();
	ui.draggable.draggable("disable");
}

function onActivate(event, ui, droppable) {

	var employeeId = droppable.parent()[0].id.substring(9); // Must be format 'employee-00'.
	var employeeIndex = parseInt(employeeId) - 1;

	var weekDayIndex = retrieveWeekDayIndex(ui.draggable[0].id);

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
}

function onOver(event, ui, droppable) {

	// droppable.addClass("drag-over");
}

function onOut(event, ui, droppable) {

	// droppable.removeClass("drag-over");
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
