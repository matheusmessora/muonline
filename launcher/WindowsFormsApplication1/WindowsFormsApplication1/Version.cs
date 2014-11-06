using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace WindowsFormsApplication1
{
    [DataContract]
    class Version
    {
        [DataMember(Name = "version")]
        public String version { get; set; }

        [DataMember(Name = "files")]
        public Files[] files { get; set; }
    }

    [DataContract]
    public class Files
    {
        [DataMember(Name = "local")]
        public String local { get; set; }


        [DataMember(Name = "hash")]
        public String hash { get; set; }
    }
}
