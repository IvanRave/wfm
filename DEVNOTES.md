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

	Log - Column match - replace: function t() return …
	Change model to without external load
	Divider for txt files (when click to Test function)
	If duplicates for one month - different data - what
	Move convertor (volume and time) constant to separate object - to not calculate every time
	Save forecast parameters in DB
	Переделать без подгрузки к Html. Вместить в одну модель
	Get well files - only need (for example - only logs)
	Выдавать форматы для всех колонок. Преобразовывать значения (FT, F, M) в (feet, meters) на клиенте не получится, для картинки необходимо на сервере.
	Нужно составлять полный класс данных для проверки (перед выбором колонок)
	Нужно от клиента отправлять цвет линии, начальное и конечное значения (потенциально эти данные могут быть заданы самим пользователем)
	
	Напротив каждой глубины ставить запись (заметку, прикреплять фото, документ и т.п.)
	Как отдельный сервис - загружаешь файл - выбираешь поля - на выходе рисунок
	
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
Простая авторизация через SSL
Единая авторизация c IPad (чтобы был доступ к элементам сайта, необходимо делать авторизацию на едином сервере)
Добавлять новые параметры Production Data (dynamic)
Показать в таблице
Сделать без скролов стиль
Хэш-теги для обновления страниц с папками
мультизагрузка - загрузка нескольких файлов одновременно
Удаление файлов только владельцами или админами
Добавить все необходимые поля, характеризующие пользователя
Date to english language - Дата отображается в зависимости от языка браузера

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

 Пользователь выбирает дату и время начала теста.
 Добавляется по умолчанию первый час
 1	10:38
 2	11:38
 ...

 DynamicTableEntity for many properties
 

 Well test questions:
- Набор параметров для всех тестов одной скважины будет одинаков? или могут быть разные наборы параметров для разных тестов?
Да набор параметров один и тот же для всех скважин. Но было бы удобнее иметь библиотеку и выбирать из нее. 


- Можно еще раз уточнить, какие единицы измерения у Injection CR, Separator CR и какого типа данные могут быть (только числовые или строковые)?
Injection CR и Separator CR пока опустите
 


- И для более удобного наименования величин в коде, как расшифровываются CR, FTP, WHT, CSG, TGLR?
CR - chart reading
FTP - flowing tubing pressure
WHT - wellhead pressure
CSG - casing pressure
TGLR - total gas lift ratio 


- Последние три параметра "Inj Gas mscf" , "Total Sep Gas mscf" , "Form Gas mscfd" рассчитываютя из другого (скрытого) листа. Как их вычислять? (от них зависят итоговые параметры: "Total Sep Gas mscfd", "Injection Gas mscfd", "GOR", "TGLR")


Пока опустите это. Пусть юзер вручную вбивает их. "Total Sep Gas mscfd", "Injection Gas mscfd" - это опциональные параметры,их можно хранить в библиотеке.


- Gas Lift Temp, psi - по названию вроде как температура, а по единице измерения - давление.


Все верно, температура. В файле ошибка. Опциональный параметр. 


- В Excel файле есть Orifice parameters, такие как AGAR/ Micro motion Factor = 1 и другие. Я так понял, что часть из них постоянные величины, а другие видимо надо указывать в каждом новом тесте?


Пока опустите это 


- Как вычислять величины "Sand %, "WHT F", которым не заданы никакие формулы и нет сопоставлений в почасовой таблице.
 WHT - это замеренная температура. В конце берется средняя величина.
Sand% - берется средняя величина


TestData:
Id
StartDateTime
Status (Declined (false), Approved (true) or Pending(null))


Duration (equivalent to hour test count)