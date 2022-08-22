# Scheduler
*Scheduler -- competition schedule getter.*

**Dev doc**: This contract includes the following functionality:
 - Getting of week schedule for the head to head competitions in the Fantasy League.
 - Getting of schedule for the 16th and 17th weeks of the head to head competitions. It is playoff in the Fantasy
   League.

## Table of contents:
- [Functions:](#functions)
  - [`initialize()` (external) ](#scheduler-initialize--)
  - [`getH2HWeekSchedule(uint256 _week) → uint8[12]` (external) ](#scheduler-geth2hweekschedule-uint256-)
  - [`getPlayoffWeekSchedule(uint256 _week) → uint8[4]` (external) ](#scheduler-getplayoffweekschedule-uint256-)


## Functions <a name="functions"></a>

### `initialize()` (external) <a name="scheduler-initialize--"></a>


### `getH2HWeekSchedule(uint256 _week) → uint8[12]` (external) <a name="scheduler-geth2hweekschedule-uint256-"></a>

*Description*: The elements of the array are read in pairs, that is, elements with indexes zero and one correspond to the
first pair, and so on. Each value is the index of the user (is equals to team) in the division.

The number "12" (the array size) here means the size of the division.
**Dev doc**: Returns the week schedule for the head to head competitions in the Fantasy League.



#### Params
 - `_week`: Competition week number.


### `getPlayoffWeekSchedule(uint256 _week) → uint8[4]` (external) <a name="scheduler-getplayoffweekschedule-uint256-"></a>

*Description*: The number "4" (the array size) here means the number of playoff competitors.
**Dev doc**: Returns the schedule for playoff competitions for the 16th and 17th weeks of the Fantasy League.



#### Params
 - `_week`: Competition week number.

