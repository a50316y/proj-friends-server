# friends 交友平台(後端)

> 一個簡易的交友平台(後端部份)   
> 使用資料庫:mongoDB  
> 使用其他工具:socket base64-img  
> --->[前端部份](https://github.com/a50316y/proj-friends-web)  

## 功能(api)
1.註冊  
2.登入  
3.個人資訊修改  
4.上傳相片  
5.交友申請  
6.顯示朋友列表    
7.顯示其他成員列表    
8.聊天  


## 1.註冊

### 請求URL
```
localhost:3000/users/register
```
### 請求方式
```
POST
```
## 2.登入

### 請求URL
```
localhost:3000/users/login
```
### 請求方式
```
POST
```

## 3.個人資訊修改 

### 請求URL
```
localhost:3000/users/update
```
### 請求方式
```
POST
```
## 4.上傳相片  

### 請求URL
```
localhost:3000/users/uploadImg
```
### 請求方式
```
POST(前端上傳照片(base64)至後端後，後端會轉成檔案存取並回傳照片URL回前端，前端需再呼叫另一支API(localhost:3000/users/updateImg)存取相片URL至後端資料庫)  

```
## 5.交友申請  

### 請求URL
```
localhost:3000/apply/userIsLike
```
### 請求方式
```
POST  
```
## 6.顯示朋友列表  

### 請求URL
```
localhost:3000/users/getFriendList
```
### 請求方式
```
POST  
```
## 7.顯示其他成員資訊(除本人外的其他user資訊)  

### 請求URL
```
localhost:3000/users/getAllUser
```
### 請求方式
```
POST  
```
## 8.聊天  
### 使用工具
```
socket
```
### 請求URL
``` 
localhost:3000/chat/getMsg  (開啟聊天室時，會呼叫此API已取得歷史訊息 )   
```
### 請求方式
```
POST  
```  
