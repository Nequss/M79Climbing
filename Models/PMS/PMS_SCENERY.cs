/*
     typedef struct tagPMS_SCENERY {
    	UBYTE nameLen;
    	CHAR name[nameLen];
    	CHAR nameFiller[50-nameLen];
    	PMS_TIMESTAMP timestamp;
    } PMS_SCENERY;
*/

namespace M79Climbing.Models.PMS
{
    public class PMS_SCENERY
    {
        byte nameLen;
        char[] name;
        char[] nameFiller; // 50 - nameLen
        PMS_TIMESTAMP timestamp;

        public PMS_SCENERY(BinaryReader br)
        {
            nameLen = br.ReadByte();
            name = br.ReadChars(this.nameLen);
            nameFiller = br.ReadChars(50 - this.nameLen);
            timestamp = new PMS_TIMESTAMP(br);
        }
    }
}
