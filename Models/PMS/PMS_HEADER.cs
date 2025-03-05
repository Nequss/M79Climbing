namespace M79Climbing.Models.PMS
{
    /* 
        typedef struct tagPMS_HEADER {
	    LONG version;
        } PMS_HEADER;
    */

    public class PMS_HEADER
    {
        public uint version; 

        public PMS_HEADER(uint version)
        {
            version = version;
        }
    }
}
