 #include <stdio.h>   
int prime(int c)
{ 
	  int x=3;
	   if(c==2 || c==3){ return 1; }
	   else if(c%2==0){return 0;}
	   while(x<c){
		if((c%x)==0)
		{return 0;
		}x+=2; }return 1; //Improves efficiency by ignoring even numbers
}
int main()
   {
     printf("PRIMES: ENTER A NUMBER: ");
	int c; scanf("%d",&c);
	int v=prime(c);
	   if(v==1)printf("PRIME!\n"); 
	 else
		printf("NOT A PRIME!\n");
	 int y=c+1;
	 while(prime(y)!=1)
	 {y+=1;}
	 printf("Next Prime: %d\n",y);
	  y=c-1;
	 while(prime(y)!=1 && y>0)
	 {y-=1;}
	 printf("Prev Prime: %d\n",y);
	   return 0;
   }
