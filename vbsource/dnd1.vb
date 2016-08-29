00010	J4 = 1 'difficulty level
00030	Console.Writeln ""
00100	'base 0
00110	X = 0 'inventory counter
00120	J = 0 'current weapon
00130	K = 0
00140	X1 = 0 'cleric spellbook counter
00150	X3 = 0 'wizard spellbook counter
00160	J9 = Rnd(clk(j9)) 'randomsize seed
00170	Dim C(7) As Double ' attribute values
00171	'Dim strC(7) As String 'attribute names [0] = class
00172	Dim W(100) As Integer 'Inventory
00173	Dim D(50,50) As Double 'dungeon map (25,25)
00174	'Dim P(100) As Double
00175	'Dim strI(100) As String
00176	Dim B(100,6) As Double 'monster stats
00177	Dim strB(100) As String 'monster names
00180	Dim E(100) As Double
00181	Dim F(100) As Double
00182	Dim X5(100) As Integer 'cleric spell prices
00183	Dim X6(100) As Integer 'wizard spell prices
00184	Dim X2(100) As Integer 'cleric spellbook
00185	Dim X4(100) As Integer 'wizard spellbook
00190	G = Int(Rnd(0) * 24 + 2) 'map x
'end of page 1
00200	H = Int(Rnd(0) * 24 + 2) 'map y
00210	'File #1 = "DNG1"
00220	'File #2 = "DNG2"
00221	'File #3 = "DNG3"
00222	'File #4 = "DNG4"
00223	'File #5 = "DNG5"
00224	'File #6 = "DNG6"
00230	'restore #4
00240	'File #7 = "GMSTR"
00245	'restore #7
00250	'restore #1
00260	'restore #2
00261	'restore #3
00262	'restore #4 'duplicate of 00230
00263	'restore #5
00264	'restore #6
00270	'Data "STR","DEX","CON","CHAR","WIS","INT","GOLD"
00280	'Data "SWORD",10,"2-H-SWORD",15,"DAGGER",3,"MACE",5
00290	'Data "SPEAR",2,"BOW",25,"ARROWS",2,"LEATHER MAIL",15
00300	'Data "CHAIN MAIL",30,"TLTE MAIL",50,"ROPE",1,"SPIKES",1
00310	'Data "FLASK OF OIL",2,"SILVER CROSS",25,"SPARE FOOD",5
00320	Console.Writeln "     DUNGEONS AND DRAGONS #1"
00330	Console.Writeln ""
00340	Console.Write "DO YOU NEED INSTRUCTIONS "
00350	Input strQ
00360	If (strQ = "YES") Then Goto 01730
00370	If (strQ = "Y") Then Goto 01730
00380	Console.Write "OLD OR NEW GAME"
00390	Input strQ
00400	If (strQ = "OLD") Then Goto 01770
00410	Console.Write "Dungeon #"
00420	Input D 'dungeon map slot
00421	Console.Write "CONTINUES RESET 1=YES,2=NO "
00422	Input J6
00430	' ROLLING CHARICTERISTICS
00440	Console.Write "PLATERS NME "
00450	Input strN
00460	If (strN <> "SHAVS") Then Goto 01730
00464	Dim strC() = {"","STR","DEX","CON","CHAR","WIS","INT","GOLD"}
00465	'For M=1 To 7
00466	'	Read strC(M)
00467	'Next M
00470	For M = 1 To 7
00490		For N = 1 To 3
00500			R = Int(Rnd(0) * 6 + 1)
00510			C(M)=C(M) + R
00520		Next N
00530		If (M=7) Then
00540			C(M) = C(M) * 15
00541		End If
00550	'
00560		Console.Write strC(M) + "=" + C(M)
00570	Next M
00580	Console.Writeln
00590	Console.Writeln "CLASSIFICATION"
00600	Console.Writeln "WHICH DO YOU WANT TO BE"
00610	Console.Write "FIGHTER ,CLERIC ,OR WIZARD"
00620	Input strC(0)
00625	If (strC(0) <> "NONE") Then Goto 00630
00626	For M7 = 0 To 7
00627		C(M7) = 0
00628	Next M7
00629	Goto 00470
00630	If (strC(0) = "FIGHTER") Then Goto 00770
00640	If (strC(0) = "CLERIC") Then Goto 00810
00650	If (strC(0) = "WIZARD") Then Goto 00790
00660	Goto 00620 'should be 00580
00670	Console.Writeln "BUYING WEAPONS"
00680	Console.Writeln "FAST OR NORM"
00690	Input strQ3
'end of page 2
00691	Dim strI() = {"","SWORD","2-H-SWORD","DAGGER","MACE","SPEAR","BOW","ARROWS","LEATHER MAIL","CHAIN MAIL","TLTE MAIL","ROPE","SPIKES","FLASK OF OIL","SILVER CROSS","SPARE FOOD"}
00692	Dim P() = {0,10,15,3,5,2,25,2,15,30,50,1,1,2,25,5}
00700	Console.Writeln "NUMBER" + vbtab + "ITEM" + vbtab + "PRICE"
00705	Console.Writeln "-1-STOP"
00710	For M = 1 To 15
00720		'Read strI(M),P(M)
00725		If (strQ3 = "FAST") Then Goto 00740
00730		Console.Writeln M + vbtab + strI(M) + vbtab + P(M)
00740	Next M
00750	Call Subr1 'gosub 01150
00760	Goto 00830
00770	C(0) = Int(Rnd(0) * 8 + 1)
00780	Goto 00670
00790	C(0) = Int(Rnd(0) * 4 + 1)
00800	Goto 00670
00810	C(0) = Int(Rnd(0) * 6 + 1)
00820	Goto 00670
00830	'
00850	X = X + 1
00860	Input Y
00870	'
00880	If (Y < 0) Then Goto 01000
00885	If (Y > 15) Then Goto 01000
00890	If (C(7) - P(Y) < 0) Then Goto 00970
00900	If (strC(0) = "CLERIC") Then Goto 01290
00910	If (strC(0) = "WIZARD") Then Goto 01350
00920	'
00930	C(7) = C(7) - P(Y)
00940	Console.Writeln "GP= " + C(7)
00950	W(X) = Y
00960	Goto 00830
00970	Console.Writeln "COSTS TOO MUCH"
00980	Console.Write "TRY AGAINN "
00990	Goto 00860 'was 00830 - results in empty slots in inventory
01000	Console.Writeln "GP= " + C(7)
01010	'
01020	Console.Write "EQ LIST "
01030	Input strQ
01040	If (strQ = "NO") Then Goto 01090
01050	For M = 1 To X
01060		If (W(M) = 0) Then Goto 01080 'skips blank lines but no longer needed
01070		Console.Writeln W(M) + vbtab + strI(W(M))
01080	Next M
01090	Console.Writeln "YOUR CHARACTERISTICS ARE:"
01100	Console.Writeln strC(0)
01101	If (C(0) <> 1) Then Goto 01110
01102	C(0) = 2
01110	Console.Writeln "HIT POINTS" + vbtab + C(0)
01120	Console.Writeln ""
01130	Console.Writeln ""
01140	Goto 01400
		Sub Subr1()
01150		'Data "MAN",1,13,26,1,1,500
01160		'Data "GOBLIN",2,13,24,1,1,600
01170		'Data "TROLL",3,15,35,1,1,1000
01180		'Data "SKELETON",4,22,12,1,1,50
01190		'Data "BALROG",5,18,110,1,1,5000
' end of page 3
01200		'Data "OCHRE JELLY",6,11,20,1,1,0
01210		'Data "GREY OOZE",7,11,13,1,1,0
01220		'Data "GNOME",8,13,30,1,1,100
01230		'Data "KOBOLD",9,15,16,1,1,500
01240		'Data "MUMMY",10,16,30,1,1,100
			strB = {"MAN","GOBLIN","TROLL","SKELETON","BALROG","OCHRE JELLY","GREY OOZE","GNOME","KOBOLD","MUMMY"}
			B = {{1,13,26,1,1,500},{2,13,24,1,1,600},{3,15,35,1,1,1000},{4,22,12,1,1,50},{5,18,110,1,1,5000},{6,11,20,1,1,0},{7,11,13,1,1,0},{8,13,30,1,1,100},{9,15,16,1,1,500},{10,16,30,1,1,100}}
01250		For M = 1 To 10
01260			'Read strB(M),B(M,1),B(M,2),B(M,3),B(M,4),B(M,5),B(M,6)
01265			B(M,4) = B(M,3)
01267			B(M,5) = B(M,6)
01269			B(M,1) = 1
01270		Next M
01280	End Sub 'RETURN
01290	If (Y = 4) Then Goto 00920
01300	If (Y = 8) Then Goto 00920
01310	If (Y = 9) Then Goto 00920
01320	If (Y > 10) Then Goto 00920
01330	Console.Writeln "YOUR A CLERIC YOU CANT USE THAT "
01340	Goto 00860
01350	If (Y = 3) Then Goto 00920
01360	If (Y = 8) Then Goto 00920
01370	If (Y > 10) Then Goto 00920
01380	Console.Writeln "YOUR A WIZARD YOU CANT USE THAT "
01390	Goto 00860
01400	' READ DUNGEON AND START GAME
01410	'Restone #D
01415	Console.Writeln "READING DUNGEON NUM. " + D
01420	For M = 0 To 25
01430		For N = 0 To 25
01431			D(M,N) = 0
01432			If (D = 0) Then Goto 01450
01440			'Read #D, D(M,N)
01443			If (D(M,N) <> 0) Then Goto 01450
01445			If (Rnd(0) < 0.97) Then Goto 01447
01446			D(M,N) = 7
01447			If (Rnd(0) < 0.97) Then Goto 01450
01448			D(M,N) = 8
01450		Next N
01460	Next M
01470	' Yea Start
01480	Console.Writeln
01490	Console.Writeln
01500	Console.Writeln
01510	Console.Writeln "WELCOME TO DUNGEON #" + D
01520	Console.Writeln "YOU ARE AT (" + G + "," + H + ")"
01530	Console.Writeln
01540	Console.Write "COMANDS LIST" + vbtab
01541	Input strQ
01542	If (strQ <> "YES") Then Goto 01590
01550	Console.Writeln
01560	Console.Writeln "1=MOVE  2=OPEN DOOR  3=SEARCH FOR TRAPS AND SECRET DOORS"
01570	Console.Writeln "4=SWITCH WEAPON HN HAND  5=FIGHT"
01580	Console.Writeln "6=LOOK AROUND  7=SAVE GAME  8=USER MAGIC  9=BUY MAGIC"
01585	Console.Writeln "0=PASS  11=BUY H.P."
01590	Console.Write "COMMAND="
01600	Input T
01605	If (T=11) Then Goto 10830
01606	If (T=12) Then Goto 11000
01610	If (T=1) Then Goto 02170
01620	If (T=2) Then Goto 03130
01630	If (T=3) Then Goto 03430
01640	If (T=4) Then Goto 03640
01650	If (T=5) Then Goto 03750
01660	If (T=6) Then Goto 06390
01670	If (T=7) Then Goto 06610
01680	If (T=8) Then Goto 08680
01690	If (T=9) Then Goto 09980
'end of page 4
01700	If (T=10) Then Goto 10730
01705	If (T=0) Then Goto 07000
01710	Console.Write "COME ON ";
01720	Goto 01590
01730	' instructions
01740	Console.Writeln "WHO SAID YOU COULD PLAY"
01750	Stop
01760	Goto 00380
01770	'read out old game
01775	restore #7
01780	read #7,D 'map
01790	read #7,X 'inventory counter
01800	read #7,J
01810	read #7,G 'map x
01820	read #7,H 'map y
01830	read #7,K
01840	For M = 0 To 25
01850		For N = 0 To 25
01860			read #7,D(M,N)
01870		Next N
01880	Next M
01890	For M = 1 To X
01900		read #7,W(M) 'inventory items
01910	Next M
01920	For M = 1 To 10
01930		read #7,strB(M) ' monster name
01940		For N = 1 To 6
01950			read #7,B(M,N) 'monster stats
01960		Next N
01970	Next M
01980	For M = 0 To 7
01990		Read #7,strC(M) 'character attribute names
02000		Read #7,C(M) 'character attribute value
02010	Next M
02020	Read #7,strN
02030	Read #7,F1
02040	Read #7,F2
02050	For M = 1 To 15
02060		Read #7,strI(M)
02070	Next M
02080	Read #7,X3
02090	For M = 1 To X3
02100		Read #7,X4(M)
02110	Next M
02151	Read #7,F2
02152	Read #7,F1
02160	Goto 01510
02170	' move
02175	Console.Writeln "YOU ARE AT " + G + " , " + H
02180	Console.Writeln "  DOWN  RIGHT  LEFT  OR  UP"
02190	Input strQ
'end of page 5
02200	If (strQ = "RIGHT") Then Goto 02260
02205	If (strQ = "R") Then Goto 02260
02210	If (strQ = "LEFT") Then Goto 02290
02215	If (strQ = "L") Then Goto 02290
02220	If (strQ = "UP") Then Goto 02320
02225	If (strQ = "U") Then Goto 02320
02230	If (strQ = "DOWN") Then Goto 02350
02235	If (strQ = "D") Then Goto 02350
02240	Goto 02180
02250	'
02260	S = 0 'deltaY
02270	T = 1 'deltaX
02280	Goto 02370
02290	S = 0 'deltaY
02300	T = -1 'deltaX
02310	Goto 02370
02320	S = -1 'deltaY
02330	T = 0 'deltaX
02340	Goto 02370
02350	S = 1 'deltaY
02360	T = 0 'deltaX
02370	If (D(G+S,H+T)=0) Then Goto 02430 'empty space
02380	If (D(G+S,H+T)=1) Then Goto 02480 'wall
02390	If (D(G+S,H+T)=2) Then Goto 02550 'trap
02400	If (D(G+S,H+T)=3) Then Goto 02990 'secret door - maybe
02401	If (D(G+S,H+T)=7) Then Goto 02424 'increase str
02402	If (D(G+S,H+T)=8) Then Goto 02426 'increase con
02410	If (D(G+S,H+T)=5) Then Goto 03060 'monster
02411	If (D(G+S,H+T)=6) Then Goto 02413 'gold
02412	Goto 02480
02413	Console.Writeln "AH......GOLD......"
02414	G9=Int(Rnd(0) * 500 + 10)
02415	Console.WriteLN G9 + "PIECES"
02416	C(7) = C(7) + G9
02417	Console.Writeln "GP= " + C(7)
02418	D(G+S,H+T) = 0
02419	If (Rnd(0) > 0.2) Then 02430
02420	Console.Writeln "       POISON      "
02421	C(0)=C(0) - Int(Rnd(0) * 4 + 1)
02422	Console.Writeln "HP= " + C(0)
02423	Goto 02430
02424	C(1) = C(1) + 1
02425	Goto 02418
02426	C(3) = C(3) + 1
02429	Goto 02418
02430	G = G + S
02440	H = H + T
02450	Console.Writeln "DONE"
02460	Goto 07000
02470	'
02480	Console.Writeln "YOU RAN INTO A WALL"
02490	If ((Rnd(0) * 12 + 1) > 9) Then Goto 02520
'end of page 6
02500	Console.Writeln "BUT NO DAMAGE WAS INFLICTED"
02510	Goto 07000
02520	Console.Writeln "AND LOOSE 1 HIT POINT"
02530	C(0) = C(0) - 1
02540	Goto 07000
02550	Console.Writeln "OOOOPS A TRAP AND YOU FELL IN"
02560	If ((Rnd(0) * 2) > 2) Then Goto 02580
02580	Console.Writeln "AND HIT POINTS LOOSE 1"
02590	C(0) = C(0) - 1
02600	Console.Writeln "I HOPE YOU HAVE SOME SPIKES AND PREFERABLY ROPE"
02610	Console.Writeln "LET ME SEE"
02620	For M = 1 To X
02630		If (W(M) <> 12) Then Goto 02660
02640		W(M) = 0
02650		Goto 02680
02660	Next M
02670	Goto 02740
02680	For M = 1 To X
02690		If (W(M) <> 11) Then Goto 02720
02700		W(M) = 0
02710		Goto 02760
02720	Next M
02730	Goto 02890
02740	Console.Writeln "NO SPIKES AH THATS TOO BAD CAUSE YOUR DEAD"
02750	Stop
02760	Console.Writeln "GOOD BOTH"
02770	Console.Writeln "YOU MANAGE TO GET OUT EASY"
02775	Goto 02870
02780	For M = 1 To X
02790		If (W(M) = 12) Then Goto 02820
02800	Next M
02810	If (B9 > 1) Then Goto 02830
02820	W(M) = 0
02830	Goto 02870
02840	W(M) = 0
02850	W(M) = 0
02860	Goto 02820
02870	Console.Writeln "YOUR STANDING NEXT TO THE EDGE THOUGH I'D MOVE"
02880	Goto 02170
02890	Console.Writeln "NO ROPE BUT AT LEAST SPIKES"
02900	If (Int(Rnd(0) * 3) + 1 = 2) Then Goto 02920
02910	Goto 02770
02920	Console.Writeln "YOU FALL HALFWAY UP"
02930	If (Int(Rnd(0) * 6) > C(1) / 3) Then Goto 02960
02940	Console.Writeln "TRY AGAIN "
02950	Goto 02900
02960	Console.Writeln "OOPS H.P. LOOSE 1"
02970	C(0) = C(0) - 1
02980	Goto 02940
02990	If (Int(Rnd(0) * 6)) Then Goto 03010 'line number looks wrong 0300 - guessing 03000
'end of page 7
03000	Goto 02480
03010	Console.Writeln "YOU JUST RAN INTO A SECRET DOOR"
03020	Console.Writeln "AND OPENED IT"
03030	G = G + S
03040	H = H + T
03050	Goto 02540
03060	Console.Writeln "YOU RAN INTO THE MONSTER"
03070	Console.Writeln "HE SHOVES YOU BACK"
03080	Console.Writeln
03090	If (Int(Rnd(0) * 2) + 1 = 2) Then Goto 03120
03100	Console.Writeln "YOU LOOSE 6 HIT POINT "
03110	C(0) = C(0) - 6
03120	Goto 07000
03130	Console.Writeln "DOOR LEFT RIGHT UP OR DOWN"
03140	Input strQ
03150	If (strQ = "RIGHT") Then Goto 03200
03155	If (strQ = "R") Then Goto 03200
03160	If (strQ = "LEFT") Then Goto 03230
03165	If (strQ = "L") Then Goto 03230
03170	If (strQ = "UP") Then Goto 03260
03175	If (strQ = "U") Then Goto 03260
03180	If (strQ = "DOWN") Then Goto 03290
03185	If (strQ = "D") Then Goto 03290
03190	Goto 03130
03200	S = 0 'deltaY
03210	T = 1 'deltaX
03220	Goto 03310
03230	S = 0 'deltaY
03240	T = -1 'deltaX
03250	Goto 03310
03260	S = -1 'deltaY
03270	T = 0 'deltaX
03280	Goto 03310
03290	S = 1 'deltaY
03300	T = 0 'deltaX
03310	If (D(G+S,H+T)=4) Then Goto 03350
03320	If (D(G+S,H+T)=3) Then Goto 03350
03330	Console.Writeln "THERE IS NOT A DOOR THERE"
03340	Goto 01590 'get a new command
03350	Console.Writeln "PUSH"
03360	If (Int(Rnd(0) * 20) + 1 < C(1)) Then 03390
03370	Console.Writeln "DIDNT BUDGE"
03380	Goto 07000
03390	Console.Writeln "ITS OPEN"
03400	G = G + S
03410	H = H + T
03420	Goto 02450
03430	Console.Writeln "SEARCH.........SEARCH...........SEARCH..........."
03440	If (Int(Rnd(0) * 40) < C(5) + C(6)) Then Goto 03470
03450	Console.Writeln "NO NOT THAT YOU CAN TELL"
03460	Goto 07000
03470	For M = -1 To 1
03480		For N = -1 To 1
03490			If (D(G+M,H+N) = 2) Then Goto 03550
'end of page 8
03500			If (D(G+M,H+N) = 3) Then Goto 03590
03510		Next N
03520	Next M
03530	'
03540	Goto 03450
03550	Console.Writeln "YES THERE IS A TRAP"
03560	Console.Writeln "IT IS " + M + "VERTICALY  " + N + "HORAZONTALY FROM YOU"
03570	Z = 1
03580	Goto 03500
03590	Console.Writeln "YES ITS A DOOR"
03600	Console.Writeln "IT IS " + M + "VERTICALLY  " + N + "HORAZONTALY"
03610	Z = 1
03620	Goto 03510
03630	'
03640	Console.Writeln "WHICH WEAPON WILL YOU HOLD, NUM OF WEAPON "
03650	Input Y
03660	If (Y = 0) Then Goto 03720
03670	For M = 1 To X
03680		If (W(M) = Y) Then Goto 03720
03690	Next M
03700	Console.Writeln "SORRY YOU DONT HAVE THAT ONE"
03710	Goto 03640
03720	Console.Writeln "O.K. YOU ARE NOW HOLDING A " + strI(Y)
03730	J = Y
03740	Goto 07000
03750	' fighting back
03760	Console.Writeln "YOUR WEAPON IS " + strI(J)
03770	If (K = 0) Then Goto 01590 'get a new command
03780	Console.Writeln strB(K)
03790	Console.Writeln "HP=" + B(K,3)
03800	If (J = 0) Then Goto 04460
03810	If (J = 1) Then Goto 04680
03820	If (J = 2) Then Goto 04860
03830	If (J = 3) Then Goto 05040
03840	If (J = 4) Then Goto 05270
03850	If (J > 4) Then Goto 03870
03860	Goto 03880
03870	If (J < 15) Then Goto 05450
03880	Console.Writeln "FOOD ???.... WELL O.K."
03890	Console.Write "IS IT TO HIT OR DISTRACT"
03900	Input strQ
03910	If (strQ = "HIT") Then Goto 04330
03920	Console.Write "THROW A-A=VE,B-BELOW,L-LEFT,OR R-RIGHT OF THE MONSTER"
03930	Z5 = 0
03940	Input strQ
03950	If (strQ = "B") Then Goto 04010
03960	If (strQ = "A") Then Goto 04040
03970	If (strQ = "L") Then Goto 04070
03980	S = 0
03990	T = 1
'end of page 9
04000	Goto 04120
04010	S = -1
04020	T = 0
04030	Goto 04120
04040	S = 1
04050	T = 0
04060	Goto 04120
04070	S = 0
04080	T = -1
04090	Goto 04120
04100	If (Z5 = 1) Then 04120
04110	If (Rnd(0)>0.5) Then 04140
04120	If (D(F1+S,F2+T) = 0) Then Goto 04220
04130	If (D(F1+S,F2+T) = 2) Then Goto 04280
04140	Console.Writeln "DIDN'T WORK"
04150	For M = 1 To X
04160		If (Z5 = Q) Then Goto 07000
04170		If (W(M) = 15) Then Goto 04190
04180	Next M
04190	W(M) = 0 'lose the food
04200	J = 0
04210	Goto 07000
04220	Console.Writeln "MONSTER MOVED BACK"
04230	D(F1,F2) = 0
04240	F1 = F1 + S
04250	F2 = F2 + T
04260	D(F1,F2) = 5
04270	Goto 04150
04280	Console.Writeln "GOOD WORK THE MONSTER FELL INTO A TRAP AND IS DEAD"
04290	K1 = -1
04300	B(K,6) = 0
04310	Goto 07000
04320	Goto 04150
04330	If (Int(Rnd(0) * 20) + 1 = 20) Then Goto 04380
04340	If (Int(Rnd(0) * 20) + 1 > B(K,2) - C(2) / 3) Then Goto 04410
04350	If (Int(Rnd(0) * 20) + 1 > 10 - C(2) / 3) Then Goto 04440
04360	Console.Writeln "TOTAL MISS"
04370	Goto 04150
04380	Console.Writeln "DIRECT HIT"
04390	B(K,3) = B(K,3) - Int(C(1) / 6)
04400	'
04410	Console.Writeln "HIT"
04420	B(K,3) = B(K,3) - Int(C(1) / 8)
04430	Goto 04150
04440	Console.Writeln "YOU HIT HIM BUT NOT GOOD ENOUGH"
04450	Goto 04150
04460	' FISTS
04470	Console.Writeln "DO YOU REALIZE YOU ARE BARE HANDED"
04480	Console.Write "DO YOU WANT TO MAKE ANOTHER CHOICE"
04490	Input strQ
'end of page 10
04500	If (strQ = "NO") Then Goto 04520
04510	Goto 01590
04520	Console.Writeln "O.K. PUNCH BITE SCRATCH HIT ........"
04530	For M = -1 To 1
04540		For N = -1 To 1
04550			If (D(G+M,H+N)=5) Then Goto 04610
04560		Next N
04570	Next M
04580	Console.Writeln "NO GOOD ONE"
04590	Goto 01590
04600	'
04610	If (Int(Rnd(0) * 20) + 1 > B(K,2)) Then Goto 04640
04620	Console.Writeln "TERRIBLE NO GOOD"
04630	Goto 07000
04640	Console.Writeln "GOOD A HIT"
04650	B(K,3) = B(K,3) - Int(C(1) / 6)
04660	Goto 01590
04670	'
04680	Console.Writeln "SWING"
04690	Call Subr2 'gosub 08410
04700	If (R1 < 2) Then Goto 04730
04710	Console.Writeln "HE IS OUT OF RANGE"
04720	Goto 07000
04730	If (R2 = 0) Then Goto 04840
04740	If (R2 = 1) Then Goto 04820
04750	If (R2 = 2) Then Goto 04790
04760	Console.Writeln "CRITICAL HIT"
04770	B(K,3) = B(K,3) - Int(C(1) / 2)
04780	Goto 01590
04790	Console.Writeln "GOOD HIT"
04800	B(K,3) = B(K,3) - Int(C(1) * 4 / 5)
04810	Goto 01590
04820	Console.Writeln "NOT GOOD ENOUGH"
04830	Goto 01590
04840	Console.Writeln "MISSED TOTALY"
04850	Goto 07000
04860	Console.Writeln "SWHNG"
04870	Call Subr2 'gosub 08410
04880	If (R1 < 2.1) Then Goto 04910
04890	Console.Writeln "HE IS OUT OF RANGE"
04900	Goto 07000
04910	If (R2 = 0) Then Goto 05020
04920	If (R2 = 1) Then Goto 05000
04930	If (R2 = 2) Then Goto 04970
04940	Console.Writeln "CRITICAL HIT"
04950	B(K,3) = B(K,3) - C(1)
04960	Goto 01590
04970	Console.Writeln "HIT"
04980	B(K,3) = B(K,3) - Int(C(1) * 5 / 7)
04990	Goto 01590
'end of page 11
05000	Console.Writeln "HIT BUT ' WELL ENOUGH"
05010	Goto 01590
05020	Console.Writeln "MISSED TOTALY"
05030	Goto 07000
05040	For M = 1 To X
05050		If (W(M) = 3) Then Goto 05090
05060	Next M
05070	Console.Writeln "YOU DONT HAVE A DAGGER"
05080	Goto 07000
05090	Call Subr2 'gosub 08410
05100	If (R1 > 5) Then Goto 04710 'OUT OF RANGE
05110	If (R2 = 0) Then Goto 05200
05120	If (R2 = 1) Then Goto 05220
05130	If (R2 = 2) Then Goto 05240
05140	Console.Writeln "CRITICAL HIT"
05150	B(K,3) = B(K,3) - Int(C(1) * 3 / 10)
05160	If (R1 < 2) Then Goto 05190
05170	W(J) = 0
05180	J = 0
05190	Goto 07000
05200	Console.Writeln "MISSED TOTALLY"
05210	Goto 05160
05220	Console.Writeln "HIT BUT NO DAMAGE"
05230	Goto 05160
05240	Console.Writeln "HIT"
05250	B(K,3) = B(K,3) - Int(C(1) / 4)
05260	Goto 05160
05270	Console.Writeln "SWING"
05280	Call Subr2 'gosub 08410
05290	If (P0 < 2) Then Goto 04720 'is this correct????
05300	Goto 04710
05310	If (R2 = 0) Then Goto 05420
05320	If (R2 = 1) Then Goto 05400
05330	If (R2 = 0) Then Goto 05370
05340	Console.Writeln "CRITICAL HIT"
05350	B(K,3) = B(K,3) - Int(C(1) * 4 / 9)
05360	Goto 01590
05370	Console.Writeln "HIT"
05380	B(K,3) = B(K,3) - Int(C(1) * 5 / 11)
05390	Goto 01590
05400	Console.Writeln "HIT BUT NO DAMAGE"
05410	Goto 01590
05420	Console.Writeln "MISS"
05430	Goto 07000
05440 '
05450	For M = 1 To X
05460		If (W(M) = J) Then Goto 05500
05470	Next M
05480	Console.Writeln "NO WEAPON FOUND"
05490	Goto 01590
'end of page 12
05500	Call Subr2 'gosub 08410
05510	If (J = 5) Then Goto 05760
05520	If (J = 6) Then Goto 05800
05530	If (J = 7) Then Goto 05840
05540	If (J = 8) Then Goto 05880
05550	If (J = 9) Then Goto 05920
05560	If (J = 10) Then Goto 05960
05570	If (J = 11) Then Goto 06000
05580	If (J = 12) Then Goto 06040
05590	If (J = 13) Then Goto 06080
05600	Console.Write "AS A CLUB OR SIGHT"
05610	Input strQ
05620	If (strQ = "SIGHT") Then Goto 05650
05630	If (J = 14) Then Goto 06120
05640	Goto 05480
05650	If (R1 < 10) Then Goto 05680
05660	Console.Writeln "FAILED"
05670	Goto 07000
05680	Console.Writeln "THE MONSTER IS HURT"
05690	R5 = 1 / 6
05700	If (K = 2) Then Goto 06200
05710	If (K = 10) Then Goto 06200
05720	If (K = 4) Then Goto 06200
05730	Goto 06260
05740	If (Int(Rnd(0) * 0 > 0)) Then Goto 06260 'always false
05750	Goto 06200
05760	R3 = 10
05770	R4 = 3 / 7
05780	R5 = 5 / 11
05790	Goto 06160
05800	R3 = 15
05810	R4 = 3 / 7
05820	R5 = 5 / 11
05821	For Z = 1 To 100
05822		If (W(Z) = 7) Then Goto 5825
05823	Next Z
05824	Goto 06280
05825	J = 7 'Arrow
05826	W(Z) = 0
05830	Goto 06160
05840	R3 = 1.5
05850	R4 = 1 / 7
05860	R5 = 1 / 5
05870	Goto 06160
05880	R3 = 4
05890	R4 = 1 / 10
05900	R5 = 1 / 8
05910	Goto 06160
05920	R3 = 4
05930	R4 = 1 / 7
05940	R5 = 1 / 6
05950	Goto 06160
05960	R3 = 3
05970	R4 = 1 / 8
05980	R5 = 1 / 5
05990	Goto 06160
'end of page 13
06000	R3 = 5
06010	R4 = 1 / 9
06020	R5 = 1 / 6
06030	Goto 06160
06040	R3 = 8
06050	R4 = 1 / 9
06060	R5 = 1 / 4
06070	Goto 06160
06080	R3 = 6
06090	R4 = 1 / 3
06100	R5 = 2 / 3
06110	Goto 06160
06120	R3 = 1.5
06130	R4 = 1 / 3
06140	R5 = 1 / 2
06150	Goto 06160
06160	If (R1 > R3) Then Goto 04710
06170	If (R2 = 0) Then Goto 06280
06180	If (R2 = 1) Then Goto 06260
06190	If (R2 = 2) Then Goto 06230
06200	Console.Writeln "CRITICAL HIT"
06210	B(K,3) = B(K,3) - Int(C(1) * R5)
06220	Goto 06300
06230	Console.Writeln "HIT"
06240	B(K,3) = B(K,3) - Int(C(1) * R4)
06250	Goto 06300
06260	Console.Writeln "HIT BUT NO DAMAGE"
06270	Goto 06300
06280	Console.Writeln "MISS"
06290	Goto 06300
06300	If (W(J) = 14) Then Goto 07000
06310	For M = 1 To X
06320		If (W(M) = J) Then 06340
06330	Next M
06340	W(M) = 0
06350	If (J <> 7) Then Goto 06360 'OUT OF ARROWS
06355	Goto 06370
06360	J = 0
06370	If (R2 > 0) Then Goto 01590
06380	Goto 07000
06390	' LOOKING
06400	For M = -5 To 5
06410		For N = -5 To 5
06420			If (M + G > 25) Then Goto 06510
06430			If (M + G < 0) Then Goto 06510
06440			If (H + N > 25) Then Goto 06510
06450			If (H + N < 0) Then Goto 06510
06460			If (M <> 0) Then Goto 06480
06470			If (N = 0) Then Goto 06590
06480			If (D(M+G,N+H) = 2) Then Goto 06550
06490			If (D(M+G,N+H) = 7 Or D(M+G,N+H) = 8) Then Goto 06550
'end of page 14
06500			Console.Write D(M+G,N+H)
06510		Next N
06520		Console.Writeln ""
06530	Next M
06540	Goto 07000
06550	Console.Write "0"
06560	Goto 06510
06570	Console.Write "1"
06580	Goto 06510
06590	Console.Write "9"
06600	Goto 06510
06610	' SAVE GAME
06615	' restore #7
06620	'write #7, D
06630	'write #7, X
06640	'write #7, J
06650	'write #7, G
06660	'write #7, H
06670	'write #7, K
06680	For M = 0 To 25
06690		For N = 0 To 25
06700			'write #7, D(M,N)
06710		Next N
06720	Next M
06730	For M = 1 To X
06740		'write '7, W(M)
06750	Next M
06760	For M = 1 To 10
06770		'write #7, strB(M)
06780		For N = 1 To 6
06790			'write #7, B(M,N)
06800		Next N
06810	Next M
06820	For M = 0 To 7
06830		'write #7, strC(M)
06840		'write #7, C(M)
06850	Next M
06860	'write #7, strN
06870	'write #7, F1
06880	For M = 1 To 15
06890		'write #7, strI(M)
06900	Next M
06910	'write #7, X3
06920	For M = 1 To X3
06930		'write #7, X4(M)
06940	Next M
06950	'write #7, X1
06960	For M = 1 To X1
06970		'write '7, X2(M)
06971	Next M
06972	'write #7, F2
06980	'write #7, F1
06985	Goto 01590
06990	Stop
'end of page 15
'routing after player turn
07000	If (K1 = -1) Then 08290
07010	If (C(0) < 2) Then 08160
07020	If (K > 0) Then 07160
07030	If (G <> 1) Then Goto 07110
07040	If (H <> 12) Then Goto 07110
07050	Console.Writeln "SO YOU HAVE RETURNED"
07060	If (C(7) < 100) Then Goto 07110
07070	C(7) = C(7) - 100
07080	Console.Writeln "WANT TO BUY MORE EQUIPMENT"
07090	Input strQ
07100	If (strQ = "YES") Then Goto 07130
07110	If (Rnd(0) * 20 > 10) Then Goto 07830
07120	Goto 01590
07130	Console.Writeln "YOUR H.P. ARE RESTORED 2 POINTS"
07140	C(0) = C(0) + 2
07150	Goto 00830
07160	Call Subr2 'gosub 08410
07170	If (B(K,3) < 1) Then Goto 08290
07180	If (R1 < 2.0) Then Goto 07600
07190	If (P0 > 10) Then Goto 01590
07200	'he is coming
07210	If (Abs(R8) > Abs(R9)) Then Goto 07260
07220	F5 = 0
07230	If (M = 1) Then Goto 07270
07240	F6 = -(R9 / Abs(R9))
07250	Goto 07280
07260	F5 = -(R8 / Abs(R8))
07270	F6 = 0
07280	For Q = 0 To 8
07290		If (Q = 1 Or Q = 5) Then Goto 07320
07300		If (F1 + F5 < 0 Or F1 + F5 > 25 Or F2 + F6 < 0 Or F2 + F6 > 25) Then Goto 07320
07310		If (D(F1+F5,F2_F6) = Q) Then Goto 07340
07320	Next Q
07330	Goto 07510
07340	If (Q = 0) Then Goto 07430
07345	If (Q = 6 Or Q = 7 Or Q = 8) Then Goto 07430
07350	If (Q = 2) Then Goto 07530
07360	If (Q = 3 Or Q = 4) Then Goto 07380
07370	Goto 07510
07380	'through the door
07390	If (D(F1+2*F5,F2+2*F6) <> 0) Then Goto 07510
07400	F5 = F5 * 2
07410	F6 = F6 * 2
07420	Goto 07440
07430	'closer
07440	D(F1, F2) = 0
07450	F1 = F1 + F5
07460	F2 = F2 + F6
07470	D(F1, F2) = 5
07480	Call Subr2 'gosub 08410
07490	'
'end of page 16
07500	Goto 01590
07510	'nowhere
07520	Goto 07490
07530	Console.Writeln "GOOD WORK  YOU LED HIM INTO A TRAP"
07540	K1 = -1
07550	B(K,6) = 0
07560	Goto 07000
07570	R8 = -0.5 * R8
07580	R9 = -0.5 * R9
07590	Goto 07420
07600	Console.Writeln strB(K) + "WATCH IT"
07610	For M = 1 To X
07620		If (W(M) = 10) Then Goto 07720
07630		If (W(M) = 9) Then Goto 07700
07640		If (W(M) = 8) Then Goto 07680
07650	Next M
07651	A1 = 6 + C(2)
07652	Goto 07730
07660	A1 = 8 + C(2)
07670	Goto 07730
07680	A1 = 12 + C(2)
07690	Goto 07730
07700	A1 = 16 + C(2)
07710	Goto 07730
07720	A1 = 20 + C(2)
07730	If (Rnd(0) * 40 > A1) Then Goto 07790
07740	If (Rnd(0) * 2 > 1) Then Goto 07770
07750	Console.Writeln "HE MISSED"
07760	Goto 01590
07770	Console.Writeln "HE HIT BUT NOT GOOD ENOUGH"
07780	Goto 07000
07790	Console.Writeln "MONSTER SCORES A HIT"
07800	C(0) = C(0) - Int(Rnd(0) * B(K,2) + 1)
07810	Console.Writeln "H.P.=" + C(0)
07820	Goto 07000
07830	For Z7 = 1 To 50
07840		For M = 1 To 10
07850			If (B(M,5) >= 1 And Rnd(0) > 0.925) Then Goto 08000
07860		Next M
07870	Next Z7
07880	Console.Writeln "ALL MONSTERS DEAD"
07890	Console.Write "RESET"
07900	Input strQ
07910	If (strQ = "YES") Then Goto 07930
07920	Stop
07930	' reset
07931	J4 = J4 + 1 'up difficultly level
07932	For M = 1 To 10
07950		B(M,3) = B(M,4) * J4
07960		B(M,6) = B(M,5) * J4
07970	Next M
07980	C(0) = C(0) + 5
07990	Goto 01590
'end of page 17
08000	K = M
08010	M1 = Int(Rnd(0) * 7 + 1)
08015	For M = -M1 To M1
08020		For N = -M1 To M1
08025			If (Abs(M) <= 2 Or Abs(N) <= 2) Then Goto 08080
08030			If (G + M < 1) Then Goto 08080
08040			If (H + N < 1) Then Goto 08080
08050			If (G + M > 25) Then Goto 08080
08060			If (H + N > 25) Then Goto 08080
08065			If (Rnd(0) > 0.7) Then Goto 08080
08070			If D(G+M, H+N) = 0 Then Goto 08110
08080		Next N
08090	Next M
08100	Goto 08010
08110	'
08120	D(G+M,H+N) = 5
08130	F1 = G + M
08140	F2 = H + N
08150	Goto 07000
08160	If (C(0) < 1) Then Goto 08190
08170	Console.Writeln "WATCH IT H.P.=" + C(0)
08180	Goto 07020
08190	If (C(0) < 0) Then Goto 08250
08200	If (C(3) < 9) Then Goto 08230
08210	Console.Writeln "H.P.=0 BUT CONST. HOLDS"
08220	Goto 07020
08230	Console.Writeln "SORRY YOUR DEAD"
08240	Stop
08250	If (C(3) < 9) Then Goto 08230
08260	C(3) = C(3) - 2
08270	C(0) = C(0) + 1
08280	Goto 08190
08290	K1 = 0
08300	C(7) = C(7) + B(k,6)
08310	F1 = 0
08320	F2 = 0
08340	Console.Writeln "GOOD WORK YOU JUST KILLED A " + strB(K)
08350	Console.Writeln "AND GET " + B(K,6) + "GOLD PIECES"
08355	If (J6 = 1) Then Goto 08370
08360	B(K,5) = 0
08370	Console.Writeln "YOU HAVE" + C(7) + " GOLD "
08380	B(K,6) = 0
08381	If (J6 <> 1) Then Goto 08390
08382	B(K,3) = B(K,4) * B(K,1) / 1
08383	B(K,6) = B(k,5) * B(k,1)
08390	K = 0
08400	Goto 07000
		Sub Subr2()
08410		'range and hit check
08420		For M = -25 To 25
08430			For N = -25 To 25
08440				If (G + M > 25) Then Goto 08490
08450				If (G + M < 0) Then Goto 08490
08460				If (H + N > 25) Then Goto 08490
08470				If (H + N < 0) Then Goto 08490
08480				If (D(G+M,H+N)=5) Then Goto 08520
08490			Next N
'end of page 18
08500		Next M
08510		R1 = 1000
08520		R8 = M
08530		R9 = N
08540		If (R1 = 1000) Then Goto 08570
08550		R1 = Sqr(M*M+N*N)
08570		If (Int(Rnd(0) * 20 + 1) > 18) Then Goto 08620
08580		If (Rnd(0) * 20 > B(K,2) = C(2) / 3) Then Goto 08640
08590		If (Rnd(0) * 2 > 1.7) Then Goto 08660
08600		R2 = 0
08610		Exit Sub
08620		R2 = 3
08630		Exit Sub
08640		R2 = 2
08650		Exit Sub
08660		R2 = 1
08670		Exit Sub
		End Sub
08680	Console.Writeln "MAGIC"
08690	If (J <> 0) Then Goto 08740
08700	If (strC(0) = "CLERIC") Then Goto 08760
08710	If (strC(0) = "WIZARD") Then Goto 09310
08720	Console.Writeln "YOU CANT TSE MAGIC YOUR NOT A M.U."
08730	Goto 07000
08740	Console.Writeln "YOU CANT USE MAGIC WITH WEAPON IN HAND"
08750	Goto 07000
08760	Console.Write "CLERICAL SPELL #"
08770	Input Q
08780	For M = 1 To X1
08790		If (Q=X2(M)) Then Goto 08830
08800	Next M
08810	Console.Writeln "YOU DONT HAVE THAT SPELL"
08820	Goto 07000
08830	X3 = X2(M)
08835	X2(M) = 0
		'route clerical spell choice
08839	If (X3 = 1) Then Goto 08950
08840	If (X3 = 2) Then Goto 09030
08850	If (X3 = 3) Then Goto 09060
08860	Q2 = 2
08870	If (X3 = 4) Then Goto 09090
08880	Q3 = 3
08890	If (X3 = 5) Then Goto 09200
08900	If (X3 = 6) Then Goto 09240
08910	If (X3 = 7) Then Goto 09280
08920	If (X3 = 8) Then Goto 09090
08930	If (X3 = 9) Then Goto 09720
08940	Goto 08810
08950	If (Rnd(0) * 3 > 1) Then Goto 09000
08960	Console.Writeln "DONE"
08970	X2(M) = 0
08980	K1 = -1
08990	Goto 07000
'end of page 19
09000	Console.Writeln "FAILED"
09010	X2(M) = 0
09020	Goto 07000
09030	Console.Writeln "DONE"
09040	B(K,3) = B(K,3) - 4
09050	Goto 09010
09060	C(3) = C(3) + 3
09070	X2(M) = 0
09080	Goto 07000
09090	X2(M) = 0
09100	For M = -3 To 3
09110		For N = -3 To 3
09120			If (G+M < 0 Or G+M > 25 Or H+N < 0 Or H+N > 25) Then Goto 09140
09130			If (D(G+M,H+N) = Q) Then Goto 09180
09140		Next N
09150	Next M
09160	Console.Writeln "NO MORE"
09170	Goto 09010
09180	Console.Writeln "THERE IS ONE AT " + M + "LAT." + N + "LONG."
09190	Goto 09140
09200	Console.Writeln "DONE"
09210	X2(M) = 0
09220	B(K,3) = B(K,3) - 2
09230	Goto 09010
09240	Console.Writeln "DONE"
09250	X2(M) = 0
09260	B(K,3) = B(K,3) - 6
09270	Goto 09010
09280	Console.Writeln "DONE"
09290	C(3) = C(3) + 3
09300	Goto 09010
09310	Console.Write "SPELL #"
09320	Input Q
09330	For M = 1 To X3
09340		If (Q=X4(M)) Then Goto 09390
09350	Next M
09360	Console.Writeln "YOU DONT HAVE THAT ONE"
09370	Goto 01590
09380	If (F1 - G = 0) Then Goto 09410
09390	If (X4(M) <> 1) Then Goto 09480
09400	Goto 09420
09410	S = 0
09420	If (F2 - H = 0) Then Goto 09450
09430	Console.Write "ARE YOU ABOVE,BELOW,RIGHT, OR LEFT OF IT"
09440	Goto 09470
09450	T = 0
09460	Z5 = 1
09470	Goto 03940
09480	If (X4(M) = 2) Then Goto 09660
09490	R = 5
'end of page 20
09500	Q = 2
09510	If (X4(M) = 3) Then Goto 09090 'routes to cleric code - wrong
09520	If (X4(M) = 4) Then Goto 09800
09530	Q = 0
09540	If (X4(M) = 5) Then Goto 09860
09550	Q = 3
09560	If (X4(M) = 6) Then Goto 09950
09570	Q = 6
09580	If (X4(M) = 7) Then Goto 09950
09590	Q = 9
09600	If (X4(M) = 8) Then Goto 09950
09610	Q = 3
09620	If (X4(M) = 9) Then Goto 09090 'routes to cleric code - wrong
09630	Q = 1
09640	If (X4(M) = 10) Then Goto 09690
09650	Goto 09360
09660	If (Rnd(0) * 3 > 1) Then Goto 09690
09670	Console.Writeln "FAILED"
09680	Goto 07000
09690	Console.Writeln "DONE"
09700	K1 = -1
09710	Goto 07000
09720	If (K = 4) Then Goto 09760
09730	If (K = 10) Then Goto 09760
09740	Console.Writeln "FAILED"
09750	Goto 07000
09760	Console.Writeln "DONE"
09770	Goto 09390
09780	T = (F2 - H) / Abs(F2 - H)
09790	Goto 04220
09800	Console.Write "INPUT CO-ORDINATES"
09810	Input M,N
09820	Console.Writeln "DONE"
09830	G = M
09840	H = N
09850	Goto 07000
09860	Console.Write "INPUT CO-ORDINATES"
09870	Input M,N
09880	If (D(M,N) = 0) Then Goto 09920
09890	If (D(M,N) = 1) Then Goto 09920
09900	Console.Writeln "FAILED"
09910	Goto 07000
09920	D(M,N) = Q
09930	Console.Writeln "DONE"
09940	Goto 07000
09950	Console.Writeln "DONE"
09960	B(K,3) = B(K,3) - Q - Int(Rnd(0) * 11)
09965	Console.Writeln "M-HP=" + B(K,3)
09970	Goto 07000
09980	If (strC(0)="CLERIC") Then Goto 10020
09990	If (strC(0)="WIZARD") Then Goto 10360
'end of page 21
10000	Console.Writeln "YOU CANT BUY ANY"
10010	Goto 01590
		'buy cleric spells
10020	Console.Write "DO YOU KNOW THE CHOICES"
10030	Input strQ
10040	If (strQ = "YES") Then Goto 10100
10050	Console.Writeln "1-KILL-500  5-MAG. MISS. #1-100"
10060	Console.Writeln "2-MAG. MISS. #2-200  6-MAG.MISS. #3-300"
10070	Console.Writeln "3-CURE LHGHT #1-200  7-CURE LIGHT #2-1000"
10080	Console.Writeln "4-FIND ALL TRAPS-200  8-FIND ALL S.DOORS-200"
10090	Console.Write "INPUT # WANTED   NEG.NUM.TO STOP"
10100	Input Q
		X5 = {0,500,200,200,200,100,300,1000,200}
10110	'X5(1) = 500
10120	'X5(2) = 200
10130	'X5(3) = 200
10140	'X5(4) = 200
10150	'X5(5) = 100
10160	'X5(6) = 300
10170	'X5(7) = 1000
10180	'X5(8) = 200
10190	If (Q < 1) Then Goto 10290
10200	If (Q > 10) Then Goto 10100
10210	If (C(7)-X5(Int(Q)) < 0) Then Goto 10270
10220	C(7) = C(7) - X5(Int(Q))
10230	Console.Writeln "IT IS YOURS"
10240	X1 = X1 + 1
10250	X2(X1) = Int(Q)
10260	Goto 10100
10270	Console.Writeln "COSTS TOO MUCH"
10280	Goto 10100
10290	Console.Writeln "YOUR SPELLS ARE"
10300	For M = 1 To X1
10310		If (X2(M) = 0) Then Goto 10330
10320		Console.Writeln "#" + X2(M)
10330	Next M
10340	Console.Writeln "DONE"
10350	Goto 01590
		'buy wizard spells
10360	Console.Write "DO YOU KNOW THE SPELLS"
10370	Input strQ
10380	If (strQ = "YES") Then Goto 10450
10390	Console.Writeln "1-PUSH-75   6-M. M. #1-100"
10400	Console.Writeln "2-KIHL-500  7-M. M. #2-200"
10410	Console.Writeln "3-FIND TRAPS-200  8-M. M. #3-300"
10420	Console.Writeln "4-TELEPORT-750  9-FIND S.DOORS-200"
10430	Console.Writeln "5-CHANGE 1+0-600  10-CHANGE 0+1-600"
10440	Console.Write "#OF ONE OU WANT  NEG.NUM.TO STOP"
10450	Input Q
		X(6) = {0,75,500,200,750,600,100,200,300,200,600}
10460	'X6(1) = 75
10470	'X6(2) = 500
10480	'X6(3) = 200
10490	'X6(4) = 750
'end of page 22 - last page at last
10500	'X6(5) = 600
10510	'X6(6) = 100
10520	'X6(7) = 200
10530	'X6(8) = 300
10540	'X6(9) = 200
10550	'X6(10) = 600
10560	If (Q < 1) Then Goto 10660
10570	If (Q > 10) Then Goto 10450 'ANOTHER BUT, WAS LIMITED TO 8 - PROB COPIED CODE FROM CLERIC
10580	If (C(7) - X6(Int(Q)) < 0) Then Goto 10640
10590	C(7) = C(7) - X6(Int(Q))
10600	Console.Writeln "IT IS YOURS"
10610	X3 = X3 + 1
10620	X4(X3) = Int(Q)
10630	Goto 10450
10640	Console.Writeln "COSTS TOO MUCH"
10650	Goto 10450
10660	Console.Writeln "YOU NOW HAVE"
10670	For M = 1 To X3
10680		If (X4(M) = 0) Then Goto 10700 'ANOTHER TYPO WAS LISTED AS 00700
10690		Console.Writeln "#" + X4(M)
10700	Next M
10710	Goto 01590
10720	'
10730	' CHEATING
10740	For M = 0 To 25
10750		For N = 0 To 25
10760			Console.Write D(M,N)
10770		Next N
10780		Console.Writeln ""
10790	Next M
10800	Goto 01590
10810	'
10820	Goto 00380 ' ?
10830	Console.Write "HOW MANY 200 GP. EACH "
10840	Input Q
10850	If (C(7) - 200 * Q < 0) Then Goto 10900
10860	C(0) = C(0) + Int(Q)
10870	C(7) = C(7) - Int(Q) * 200 'ANOTHER BUT - WAS POSSIBLE TO ENTER A FRACTION AND PAY EXTRA
10880	Console.Writeln "OK DONE"
10885	Console.Writeln "HP= " + C(0)
10886	For M = 1 To 7
10887		Console.Writeln strC(M) + "= " + C(M)
10888	Next M
10890	Goto 07000
10900	Console.Writeln "NO"
10910	Goto 10830
11000	Console.Write "DNG"
11010	Input D2
11020	Console.Write "X,Y,C"
11030	Input X9,Y9,X9
11035	If (C9 < 0) Then Goto 11060
11040	D(X9,Y9) = C9
11050	Goto 11020
11060	Console.Writeln "SAVE"
11061	Input Q
11062	If (Q<>1) Then Goto 07000
11063	For M = 0 To 25
11070		For N = 0 To 25
11080			'WRITE #D2,D(M,N)
11090		Next N
11100	Next M
11110	Goto 07000
11120	End
