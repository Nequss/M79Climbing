/*
    typedef struct tagPMS_COLLIDER {
    	BOOL active;
    	UBYTE filler[3];
    	FLOAT x;
    	FLOAT y;
    	FLOAT radius;
    } PMS_COLLIDER;
*/
namespace M79Climbing.Models.PMS
{
    public class PMS_COLLIDER
    {
        public bool active;
        public byte[] filler;
        public float x;
        public float y;
        public float radius;

        public PMS_COLLIDER(BinaryReader br) 
        { 
            this.active = Convert.ToBoolean(br.ReadBoolean());
            this.filler = br.ReadBytes(3);
            this.x = br.ReadSingle();
            this.y = br.ReadSingle();
            this.radius = br.ReadSingle();
        }
    }
}
