/*
    typedef struct tagPMS_TIMESTAMP {
    	DOSTIME time;
    	DOSDATE date;
    } PMS_TIMESTAMP;

    //TO DO
       
    typedef struct tagDOSTIME {
    	WORD second  : 5;  
    	WORD minute : 6;    
    	WORD hour    : 5;   
    } DOSTIME;
    
    typedef struct tagDOSDATE {
    	WORD day  : 5;  
    	WORD month : 4;    
    	WORD year    : 7;   
    } DOSDATE;
*/


namespace M79Climbing.Models.PMS
{
    public class PMS_TIMESTAMP
    {
        // TO DO - decode the value into bits
        // public DOSTIME time;
        // public DOSTIME date;

        public ushort time;
        public ushort date;

        public PMS_TIMESTAMP(BinaryReader br)
        {
            time = br.ReadUInt16();
            date = br.ReadUInt16();
        }
    }
}
