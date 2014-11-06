using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;
using Microsoft.Win32;
using System.Security.Principal;
using System.IO;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Security.Cryptography;

namespace WindowsFormsApplication1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();

            if (!IsAdministrator())
            {
                MessageBox.Show("Você tem certeza que rodou como administrador?");
            }

            progressBar1.Maximum = 100;
            progressBar1.Step = 1;
            progressBar1.Value = 0;
            backgroundWorker1.RunWorkerAsync();
        }

        private void button1_Click(object sender, EventArgs e)
        {

            Process.Start("main.exe");
        }

        private void radioButton1_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(1);
        }

        private void notifyIcon1_MouseDoubleClick(object sender, MouseEventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            
            Application.Exit();
        }

        private void radioButton3_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(3);
        }

        private static bool IsAdministrator()
        {
            return (new WindowsPrincipal(WindowsIdentity.GetCurrent())).IsInRole(WindowsBuiltInRole.Administrator);
        }

        private void setWindowMode(Boolean minimized)
        {
            RegistryKey reg = Registry.CurrentUser;
            RegistryKey subKey = reg.OpenSubKey(@"Software\Webzen\MU\Config", true);

            int valor = minimized ? 1 : 0;

            if (subKey == null)
            {
                RegistryKey newKey = reg.CreateSubKey(@"Software\Webzen\MU\Config");
                newKey.SetValue("WindowMode", valor, RegistryValueKind.DWord);
                newKey.Close();
            }
            else
            {
                subKey.SetValue("WindowMode", valor, RegistryValueKind.DWord);
                subKey.Close();
            }
        }

        private void removeID()
        {
            RegistryKey reg = Registry.CurrentUser;
            RegistryKey subKey = reg.OpenSubKey(@"Software\Webzen\MU\Config", true);

            if (subKey != null)
            {
                Object id = subKey.GetValue("ID");
                if (id != null)
                {
                    subKey.DeleteValue("ID");
                }

            }
        }
        private void addResolution(int id)
        {
            RegistryKey reg = Registry.CurrentUser;
            RegistryKey subKey = reg.OpenSubKey(@"Software\Webzen\MU\Config", true);

            if (subKey == null)
            {
                RegistryKey newKey = reg.CreateSubKey(@"Software\Webzen\MU\Config");
                newKey.SetValue("Resolution", id, RegistryValueKind.DWord);
                newKey.Close();
            }
            else
            {
                subKey.SetValue("Resolution", id, RegistryValueKind.DWord);
                subKey.Close();
            }
        }

        private void radioButton2_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(2);
        }

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {
            setWindowMode(!checkBox1.Checked);
        }

        private void Form1_Load(object sender, EventArgs e)
        {

                setWindowMode(false);
                radioButton3.Checked = true;
                checkBox1.Checked = true;
                addResolution(3);
                removeID();
        }

        private void radioButton2_CheckedChanged_1(object sender, EventArgs e)
        {
            addResolution(1);
        }

        private void radio1280_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(2);
        }

        private void radioButton3_CheckedChanged_1(object sender, EventArgs e)
        {
            addResolution(3);
        }

        private void button2_Click_1(object sender, EventArgs e)
        {


           
        }

        private String getHash(String filename)
        {
            try
            {
                using (FileStream stream = new FileStream(filename, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    StringBuilder sb = new StringBuilder();

                    if (stream != null)
                    {
                        stream.Seek(0, SeekOrigin.Begin);

                        MD5 md5 = MD5CryptoServiceProvider.Create();
                        byte[] hash = md5.ComputeHash(stream);
                        foreach (byte b in hash)
                            sb.Append(b.ToString("x2"));

                        stream.Seek(0, SeekOrigin.Begin);
                    }

                    return sb.ToString();
                }
            }
            catch (Exception e)
            {
                return "";
            }
            
        }

        private void backgroundWorker1_DoWork(object sender, DoWorkEventArgs e)
        {
            WebClient webClient = new WebClient();
            HttpWebRequest request = WebRequest.Create("http://worldofmu.com.br/patches/files.json") as HttpWebRequest;
            using (HttpWebResponse response = request.GetResponse() as HttpWebResponse)
            {
                if (response.StatusCode != HttpStatusCode.OK)
                    throw new Exception(String.Format(
                    "Server error (HTTP {0}: {1}).",
                    response.StatusCode,
                    response.StatusDescription));

                DataContractJsonSerializer jsonSerializer = new DataContractJsonSerializer(typeof(Version));
                object objResponse = jsonSerializer.ReadObject(response.GetResponseStream());
                Version json = objResponse as Version;
                var backgroundWorker = sender as BackgroundWorker;


                int equals = json.files.Length;
                for (int i = 0; i < json.files.Length; i++)
                {
                    String hash = getHash(json.files[i].local.ToString());
                    if (!hash.Equals(json.files[i].hash.ToString()))
                    {
                        // Create a new WebClient instance.
                        using (WebClient myWebClient = new WebClient())
                        {
                            try {
                                new FileInfo(json.files[i].local.ToString()).Directory.Create();
                                myWebClient.DownloadFile("http://worldofmu.com.br/patches/" + json.files[i].local.ToString(), json.files[i].local.ToString());
                            }
                            catch (Exception ex)
                            {
                                MessageBox.Show(ex.Message);
                            }
                        }
                    }
                    
                    backgroundWorker.ReportProgress(json.files.Length);
                }

                
            }
        }

        public void backgroundWorker1_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            progressBar1.PerformStep();
            progressBar1.Maximum = e.ProgressPercentage;

            label2.Text = "Baixando... " + progressBar1.Value + "/" + progressBar1.Maximum + " arquivos baixados.";
        }
        public void backgroundWorker1_Finished(Object sender, RunWorkerCompletedEventArgs e)
        {
            label2.Text = "Jogo atualizado. Bom divertimento!";
            button1.Visible = true;
        }

    }

    
}
