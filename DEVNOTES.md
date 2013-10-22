AngularJs: 
---
* for ngSrc and href - use {[{ my.value }]}
* for other elements use <span ng-bind="my.value"></span>

Language:
---
* Generated any language using assemble.io engine
* Add folder to assemble_store/data/lang with need language json object
* Change settings in Gruntfile.js

CORS support:
---
* Do not use in production (IE9 doesn't support requests wit json type and cookies)
* Only for development (in modern browsers) and other project types (IOS, desktop etc.)

Javascript:
---
* Use single quotes

Html:
---
* Use double quotes

Other business-logic notes:
---
Access level: (can not store in cookies because if owner downgrade access levels then user may be still access)
0 - owner
255 - viewer (some parts)

vs file wfm
Error handling when Id is busy
--- 
toDO: make open Blob container
- put into logo images
- show from there
- delete logo

we may move IsCumulative to wellgroupwfmparameter table (ovveride default)

	Log - Column match - replace: function t() return �
	Change model to without external load
	Divider for txt files (when click to Test function)
	If duplicates for one month - different data - what
	Move convertor (volume and time) constant to separate object - to not calculate every time
	Save forecast parameters in DB
	���������� ��� ��������� � Html. �������� � ���� ������
	Get well files - only need (for example - only logs)
	�������� ������� ��� ���� �������. ��������������� �������� (FT, F, M) � (feet, meters) �� ������� �� ���������, ��� �������� ���������� �� �������.
	����� ���������� ������ ����� ������ ��� �������� (����� ������� �������)
	����� �� ������� ���������� ���� �����, ��������� � �������� �������� (������������ ��� ������ ����� ���� ������ ����� �������������)
	
	�������� ������ ������� ������� ������ (�������, ����������� ����, �������� � �.�.)
	��� ��������� ������ - ���������� ���� - ��������� ���� - �� ������ �������
	
	Imported pd files go to archive
	Upload file button move to file list
	
	Filters:
		Choose need columns
		Choose sort
		Filter by something field (value less than 20)
		Make filter on table and build graphic for this table
	
	1. Upload file
		a. Check extension
		b. Show file list
		c. In folder "Not imported"
		d. Show "Import" button for every file in this folder
	2. Import file data to the database
		a. Define a divider (only for txt or csv files nor excel)
		b. Set file columns to PD table columns accordingly
		c. Check data
		d. Import to database
		e. Move a file to the "Imported" folder
������� ����������� ����� SSL
������ ����������� c IPad (����� ��� ������ � ��������� �����, ���������� ������ ����������� �� ������ �������)
��������� ����� ��������� Production Data (dynamic)
�������� � �������
������� ��� ������� �����
���-���� ��� ���������� ������� � �������
�������������� - �������� ���������� ������ ������������
�������� ������ ������ ����������� ��� ��������
�������� ��� ����������� ����, ��������������� ������������
Date to english language - ���� ������������ � ����������� �� ����� ��������

Join testdata dict with wellgroupwfmparameters
-- change test parameters from well to group

??? parameter ID ???
number

Data sheet from the ipad will load data to the table. Tests can be edited or filtered by date.

All test data are calculated in ipad but the whole table is loaded to WFM data base for validation Production potential will take the last welltest data (last valid test) When user load data from ipad Welltest data into WFM, parameters have to be specified.

??? Change row key value in azure table storage
Test Scope Change row key (start date) or not?
SQL - no dynamic feature (if we want to add summ fields to test scope)
RowKey - no: to change date we'll need to delete all test data and recreate them (with test scope entity)

RowKey - Guid
StartTime as a field
123-123
UnixStartTime?
Client:
 input field with date picker (YYYY-MM-DD)
 input field with hour (12)
 input field with minute (12)
Client Dto:
 one field - unixTime
Server:
 one field - substractedUnixTime

Well test section:
Data: 
- NOC Reading (LiquidCum - Cumulative liquid, bbl)
- WaterCut, %
- Choke (no measure unit, string)
- FTP, psi
- CSG Press, psi
- Gas Lift Press, psi
- Gas Lift Temp, psi
...

TestDataScope (for day)
 - Date
 - WellId
 - 

 ������������ �������� ���� � ����� ������ �����.
 ����������� �� ��������� ������ ���
 1	10:38
 2	11:38
 ...

 DynamicTableEntity for many properties
 

 Well test questions:
- ����� ���������� ��� ���� ������ ����� �������� ����� ��������? ��� ����� ���� ������ ������ ���������� ��� ������ ������?
�� ����� ���������� ���� � ��� �� ��� ���� �������. �� ���� �� ������� ����� ���������� � �������� �� ���. 


- ����� ��� ��� ��������, ����� ������� ��������� � Injection CR, Separator CR � ������ ���� ������ ����� ���� (������ �������� ��� ���������)?
Injection CR � Separator CR ���� ��������
 


- � ��� ����� �������� ������������ ������� � ����, ��� ���������������� CR, FTP, WHT, CSG, TGLR?
CR - chart reading
FTP - flowing tubing pressure
WHT - wellhead pressure
CSG - casing pressure
TGLR - total gas lift ratio 


- ��������� ��� ��������� "Inj Gas mscf" , "Total Sep Gas mscf" , "Form Gas mscfd" ������������� �� ������� (��������) �����. ��� �� ���������? (�� ��� ������� �������� ���������: "Total Sep Gas mscfd", "Injection Gas mscfd", "GOR", "TGLR")


���� �������� ���. ����� ���� ������� ������� ��. "Total Sep Gas mscfd", "Injection Gas mscfd" - ��� ������������ ���������,�� ����� ������� � ����������.


- Gas Lift Temp, psi - �� �������� ����� ��� �����������, � �� ������� ��������� - ��������.


��� �����, �����������. � ����� ������. ������������ ��������. 


- � Excel ����� ���� Orifice parameters, ����� ��� AGAR/ Micro motion Factor = 1 � ������. � ��� �����, ��� ����� �� ��� ���������� ��������, � ������ ������ ���� ��������� � ������ ����� �����?


���� �������� ��� 


- ��� ��������� �������� "Sand %, "WHT F", ������� �� ������ ������� ������� � ��� ������������� � ��������� �������.
 WHT - ��� ���������� �����������. � ����� ������� ������� ��������.
Sand% - ������� ������� ��������


TestData:
Id
StartDateTime
Status (Declined (false), Approved (true) or Pending(null))


Duration (equivalent to hour test count)